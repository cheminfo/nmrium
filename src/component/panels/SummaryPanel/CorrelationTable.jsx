/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { MF } from 'mf-parser';
import { useMemo, useEffect, useState, useCallback } from 'react';

import { useChartData } from '../../context/ChartContext';
import { SignalKindsToInclude } from '../extra/constants/SignalsKinds';

const tableStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  font-size: 12px;
  height: 100%;
  .react-contextmenu-wrapper {
    display: contents;
  }
  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }
  th,
  td {
    white-space: nowrap;
    text-align: center;
    margin: 0;
    padding: 0.4rem;
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;

    :last-child {
      border-right: 0;
    }
    button {
      background-color: transparent;
      border: none;
    }
  }
`;

// this is a copy of getSpectrumType method in
// nmr-parser which is currently not working properly
const getExperiment = (data) => {
  let pulse = data.info.pulseSequence;
  if (typeof pulse !== 'string') {
    return '';
  }

  pulse = pulse.toLowerCase();
  if (pulse.includes('zg') || pulse.includes('udeft')) {
    // @TODO is udeft right here?
    return '1d';
  }

  if (
    pulse.includes('hsqct') ||
    (pulse.includes('invi') && (pulse.includes('ml') || pulse.includes('di')))
  ) {
    return 'hsqctocsy';
  }

  if (pulse.includes('hsqc') || pulse.includes('invi')) {
    return 'hsqc';
  }

  if (pulse.includes('hmqc')) {
    return 'hmqc';
  }

  if (
    pulse.includes('hmbc') ||
    (pulse.includes('inv4') && pulse.includes('lp'))
  ) {
    return 'hmbc';
  }

  if (pulse.includes('cosy')) {
    return 'cosy';
  }

  if (pulse.includes('jres')) {
    return 'jres';
  }

  if (
    pulse.includes('tocsy') ||
    pulse.includes('mlev') ||
    pulse.includes('dipsi')
  ) {
    return 'tocsy';
  }

  if (pulse.includes('noesy')) {
    return 'noesy';
  }

  if (pulse.includes('roesy')) {
    return 'roesy';
  }

  if (pulse.includes('dept')) {
    return 'dept';
  }

  if (pulse.includes('jmod') || pulse.includes('apt')) {
    return 'aptjmod';
  }

  return '';
};

const CorrelationTable = () => {
  const mf = 'C11H14N2O'; //'C8H10';
  const tolerance = useMemo(() => {
    return { C: 0.25, H: 0.025, N: 0.25 };
  }, []);

  const { data } = useChartData();
  const [completeness, setCompleteness] = useState({
    complete: false,
    atomType: [],
  });
  const [additionalColumns, setAdditionalColumns] = useState([]);
  const [atoms, setAtoms] = useState({});

  useEffect(() => (mf ? setAtoms(new MF(mf).getInfo().atoms) : setAtoms({})), [
    mf,
  ]);

  const getAtomType = (nucleus) => nucleus.split(/\d+/)[1];

  // all experiments
  const experiments = useMemo(() => {
    const _experiments = {};
    if (data) {
      data
        .filter((_data) => _data.info.isFid === false)
        .forEach((_data) => {
          if (!lodash.get(_experiments, `${_data.info.dimension}D`, false)) {
            _experiments[`${_data.info.dimension}D`] = {};
          }

          let _experiment = getExperiment(_data);
          if (
            !lodash.get(
              _experiments,
              `${_data.info.dimension}D.${_experiment}`,
              false,
            )
          ) {
            _experiments[`${_data.info.dimension}D`][`${_experiment}`] = [];
          }
          _experiments[`${_data.info.dimension}D`][`${_experiment}`].push(
            _data,
          );
        });
    }
    return _experiments;
  }, [data]);

  useEffect(
    () => setAdditionalColumns(Object.keys(lodash.get(experiments, '2D', []))),
    [experiments],
  );

  // "plain" 1D experiments containing ranges, e.g. without DEPT
  const experiments1D = useMemo(() => {
    const _experiments1D = {};
    // list of experiments, because one could have more than
    // one spectrum in spectra list for one atom type
    Object.keys(atoms).forEach((atomType) => {
      const _experiments = lodash
        .get(experiments, `1D.1d`, []) // don't consider DEPT etc. here
        .map((_experiment) => {
          return getAtomType(_experiment.info.nucleus) === atomType &&
            lodash.get(_experiment, 'ranges.values', []).length > 0
            ? _experiment
            : undefined;
        })
        .filter((_experiment) => _experiment);
      if (_experiments.length > 0) {
        _experiments1D[atomType] = _experiments;
      }
    });

    return _experiments1D;
  }, [atoms, experiments]);

  // "extra" 1D experiments containing ranges, e.g. DEPT
  const experiments1DExtra = useMemo(() => {
    const _experiments1DExtra = {};
    Object.keys(lodash.get(experiments, `1D`, {}))
      .filter((_experimentType) => _experimentType !== '1d') // don't consider "plain" 1D experiments here
      .forEach((_experimentType) => {
        // list of experiments, because one could have more than
        // one spectrum in spectra list for the current experiment type
        const _experimentsExtra = experiments['1D'][_experimentType]
          .map((_experiment) =>
            lodash.get(_experiment, 'ranges.values', []).length > 0
              ? _experiment
              : undefined,
          )
          .filter((_experiment) => _experiment);
        if (_experimentsExtra.length > 0) {
          _experiments1DExtra[`${_experimentType}`] = _experimentsExtra;
        }
      });

    return _experiments1DExtra;
  }, [experiments]);

  // 2D experiments containing zones
  const experiments2D = useMemo(() => {
    const _experiments2D = {};
    // list of experiments, because one could have more than
    // one spectrum in spectra list for one atom type
    Object.keys(lodash.get(experiments, '2D', {})).forEach(
      (_experimentType) => {
        const _experiments = lodash
          .get(experiments, `2D.${_experimentType}`, [])
          .map((_experiment) =>
            lodash.get(_experiment, 'zones.values', []).length > 0
              ? _experiment
              : undefined,
          )
          .filter((_experiment) => _experiment);
        if (_experiments.length > 0) {
          _experiments2D[_experimentType] = _experiments;
        }
      },
    );

    return _experiments2D;
  }, [experiments]);

  const signals1D = useMemo(() => {
    // store valid signals from 1D experiments
    const _signals1D = {};
    Object.keys(atoms).forEach((atomType) => {
      // const atomCount = atoms[atomType];
      let _signals = [];
      if (lodash.get(experiments1D, `${atomType}`, []).length > 0) {
        // @TODO for now we will use the first occurring matched spectrum only (index)
        const index = 0;
        const __signals = experiments1D[`${atomType}`][index].ranges.values
          .map((_range) =>
            _range.signal.filter((_signal) =>
              SignalKindsToInclude.includes(_signal.kind),
            ),
          )
          .flat();
        __signals.forEach((_signal, s) =>
          _signals.push({
            experimentType: '1d',
            dimension: 1,
            atomTypes: [atomType],
            label: `${atomType}${s + 1}`,
            signal: _signal,
          }),
        );

        _signals1D[atomType] = _signals;
      }
    });

    return _signals1D;
  }, [atoms, experiments1D]);

  const signals1DExtra = useMemo(() => {
    // store valid signals from 1D extra experiments
    const _signals1DExtra = {};
    // store valid signals from 2D experiments
    Object.keys(experiments1DExtra).forEach((_experimentType) => {
      let _signals = [];
      // @TODO for now we will use the first occurring matched spectrum only (index)
      const index = 0;
      const __signals = experiments1DExtra[_experimentType][index].ranges.values
        .map((_range) =>
          _range.signal.filter((_signal) =>
            SignalKindsToInclude.includes(_signal.kind),
          ),
        )
        .flat();
      __signals.forEach((__signal, s) =>
        _signals.push({
          experimentType: _experimentType,
          dimension: 1,
          atomTypes: [
            getAtomType(
              experiments1DExtra[_experimentType][index].info.nucleus,
            ),
          ],
          label: `${_experimentType}${s + 1}`,
          signal: __signal,
        }),
      );

      if (!lodash.get(_signals1DExtra, `${_experimentType}`, false)) {
        _signals1DExtra[_experimentType] = [];
      }
      _signals1DExtra[_experimentType].push({
        signals: _signals,
        experimentType: _experimentType,
        dimension: 1,
        atomTypes: [
          getAtomType(experiments1DExtra[_experimentType][index].info.nucleus),
        ],
      });
    });

    return _signals1DExtra;
  }, [experiments1DExtra]);

  const signals2D = useMemo(() => {
    // store valid signals from 2D experiments
    const _signals2D = {};
    Object.keys(experiments2D).forEach((_experimentType) => {
      let _signals = [];
      // @TODO for now we will use the first occurring matched spectrum only (index)
      const index = 0;
      const __signals = experiments2D[_experimentType][index].zones.values
        .map((_zone) =>
          _zone.signal.filter((_signal) =>
            SignalKindsToInclude.includes(_signal.kind),
          ),
        )
        .flat();
      __signals.forEach((__signal, s) =>
        _signals.push({
          experimentType: _experimentType,
          dimension: 2,
          atomTypes: experiments2D[_experimentType][
            index
          ].info.nucleus.map((_nucleus) => getAtomType(_nucleus)),
          label: `${_experimentType}${s + 1}`,
          signal: __signal,
        }),
      );

      if (!lodash.get(_signals2D, `${_experimentType}`, false)) {
        _signals2D[_experimentType] = [];
      }
      _signals2D[_experimentType].push({
        signals: _signals,
        experimentType: _experimentType,
        dimension: 2,
        atomTypes: experiments2D[_experimentType][
          index
        ].info.nucleus.map((_nucleus) => getAtomType(_nucleus)),
      });
    });

    return _signals2D;
  }, [experiments2D]);

  const atomTypesInSpectra = useMemo(() => {
    const atomTypes1D = Object.keys(signals1D);
    const atomTypes1DExtra = Object.keys(signals1DExtra)
      .map((_experimentType) =>
        signals1DExtra[_experimentType]
          .map((_experiment) => _experiment.atomTypes)
          .flat(),
      )
      .flat()
      .filter((_atomType, i, a) => a.indexOf(_atomType) === i);
    const atomTypes2D = Object.keys(signals2D)
      .map((_experimentType) =>
        signals2D[_experimentType]
          .map((_experiment) => _experiment.atomTypes)
          .flat(),
      )
      .flat()
      .filter((_atomType, i, a) => a.indexOf(_atomType) === i);

    return {
      '1D': atomTypes1D,
      '1DExtra': atomTypes1DExtra,
      '2D': atomTypes2D,
      total: atomTypes1D
        .concat(atomTypes1DExtra)
        .concat(atomTypes2D)
        .filter((_atomType, i, a) => a.indexOf(_atomType) === i),
    };
  }, [signals1D, signals1DExtra, signals2D]);

  const checkSignalMatch = useCallback(
    (signal1, signal2, atomType) =>
      signal1.delta - tolerance[atomType] <= signal2.delta &&
      signal2.delta <= signal1.delta + tolerance[atomType],

    [tolerance],
  );

  const signals = useMemo(() => {
    const _signals = {};
    atomTypesInSpectra.total.forEach((atomType) => {
      if (lodash.get(signals1D, `${atomType}`, false)) {
        _signals[atomType] = lodash.cloneDeep(signals1D[atomType]);
      } else {
        if (!lodash.get(_signals, `${atomType}`, false)) {
          _signals[atomType] = [];
        }
        Object.keys(signals2D).forEach((_experimentType) =>
          signals2D[_experimentType].forEach((_experiment) => {
            const dim = _experiment.atomTypes.findIndex(
              (_atomType) => _atomType === atomType,
            );
            const axis = dim === 0 ? 'x' : dim === 1 ? 'y' : undefined;
            if (axis) {
              _experiment.signals.forEach((_signal2D) => {
                if (
                  !_signals[atomType].some((_signal1D) =>
                    checkSignalMatch(
                      _signal1D.signal,
                      _signal2D.signal[axis],
                      atomType,
                    ),
                  )
                ) {
                  _signals[atomType].push({
                    experimentType: _experimentType,
                    dimension: 1,
                    atomTypes: [atomType],
                    label: `${atomType}${_signals[atomType].length + 1}`,
                    signal: { delta: _signal2D.signal[axis].delta },
                  });
                }
              });
            }
          }),
        );
      }
    });

    return _signals;
  }, [atomTypesInSpectra.total, checkSignalMatch, signals1D, signals2D]);

  useEffect(() => {
    const _completeness = { atomType: {} };
    atomTypesInSpectra.total.forEach((atomType) => {
      const signalsAtomType = lodash.get(signals, `${atomType}`, []);
      const atomCount = atoms[atomType];
      _completeness.atomType[`${atomType}`] = {
        current: signalsAtomType.length,
        total: atomCount,
        complete: signalsAtomType.length === atomCount ? true : false,
      };
    });

    setCompleteness(_completeness);
  }, [atomTypesInSpectra.total, atoms, signals]);

  // useEffect(() => {
  //   console.log('\n\nexperiments:');
  //   console.log(experiments);
  //   console.log(experiments1D);
  //   console.log(experiments1DExtra);
  //   console.log(experiments2D);
  //   console.log('\nsignals:');
  //   console.log(signals1D);
  //   console.log(signals1DExtra);
  //   console.log(signals2D);
  //   console.log('\natom types:');
  //   console.log(atomTypesInSpectra);
  //   console.log('signals ALL:');
  //   console.log(signals);
  // }, [
  //   atomTypesInSpectra,
  //   experiments,
  //   experiments1D,
  //   experiments1DExtra,
  //   experiments2D,
  //   signals,
  //   signals1D,
  //   signals1DExtra,
  //   signals2D,
  // ]);

  // search for matches in extra 1D (e.g. DEPT) and 2D experiments
  const getCorrelationsFor1D = useCallback(
    (signal1D, atomType) => {
      const _correlations = [];
      // @TODO check for information from extra 1D data too, e.g. DEPT
      // Object.keys(experiments1DExtra).forEach((_experimentType) => {
      //   console.log(_experimentType);
      // });
      Object.keys(signals2D).forEach((_experimentType) =>
        signals2D[_experimentType].forEach((_experiment) => {
          const dim = _experiment.atomTypes.findIndex(
            (_atomType) => _atomType === atomType,
          );
          const axis = dim === 0 ? 'x' : dim === 1 ? 'y' : undefined;
          const matchedSignalIndices = axis
            ? _experiment.signals
                .map((_signal, i) =>
                  SignalKindsToInclude.includes(_signal.signal.kind) &&
                  checkSignalMatch(signal1D, _signal.signal[axis], atomType)
                    ? i
                    : -1,
                )
                .filter((_index) => _index >= 0)
            : [];
          if (matchedSignalIndices.length > 0) {
            _correlations.push({
              experimentType: _experimentType,
              axis,
              atomTypes: _experiment.atomTypes,
              correlation: matchedSignalIndices,
              match: [],
            });
          }
        }),
      );

      return _correlations;
    },
    [checkSignalMatch, signals2D],
  );

  const letters = [...Array(26).keys()].map((i) => String.fromCharCode(i + 97));
  const attach = useCallback(
    (
      correlations,
      correlationsAtomType,
      index,
      atomTypeToAttach,
      indicesToAttach,
    ) => {
      const correlation = correlationsAtomType[index];
      if (!lodash.get(correlation, `attached`, false)) {
        correlation.attached = {};
      }
      if (!lodash.get(correlation, `attached.${atomTypeToAttach}`, false)) {
        correlation.attached[atomTypeToAttach] = [];
      }
      correlation.attached[atomTypeToAttach] = correlation.attached[
        atomTypeToAttach
      ].concat(indicesToAttach);
      if (atomTypeToAttach === 'H') {
        indicesToAttach.forEach((indexToAttach, n) => {
          if (lodash.get(correlations, `H[${indexToAttach}]`, false)) {
            correlations.H[indexToAttach].label = `H${index + 1}${letters[n]}`;
          }
        });
      }
    },
    [letters],
  );

  const get2DSignal = useCallback(
    (experimentType, atomTypes, index) => {
      if (lodash.get(signals2D, `${experimentType}`)) {
        const _signals2D = signals2D[experimentType].find((_experiment) =>
          lodash.isEqual(atomTypes, _experiment.atomTypes),
        );
        return _signals2D ? _signals2D.signals[index] : undefined;
      }
    },
    [signals2D],
  );

  const correlations = useMemo(() => {
    const _correlations = {};
    // loop through 1D signals and search for matches in extra 1D (e.g. DEPT) and 2D experiments and link them
    atomTypesInSpectra.total.forEach((atomType) => {
      if (!lodash.get(_correlations, `${atomType}`, false)) {
        _correlations[atomType] = [];
      }
      lodash.get(signals, `${atomType}`, []).forEach((_signal1D) => {
        // search through all 1D extra and 2D spectra
        const correlations1DExtra2D = getCorrelationsFor1D(
          _signal1D.signal,
          atomType,
        ); // incl. equivalences (?)

        // now try to find again the 2D signal match (other axis) in the 1D signal list
        correlations1DExtra2D.forEach((_correlation1DExtra2D) => {
          const otherAxis = _correlation1DExtra2D.axis === 'x' ? 'y' : 'x';
          const otherAtomType =
            _correlation1DExtra2D.atomTypes[otherAxis === 'x' ? 0 : 1];
          const signalsOtherAtomType = signals[otherAtomType];

          // add the matching indices to the list
          _correlation1DExtra2D.correlation.forEach(
            (_indexWithin2DExperiment) => {
              const _signal2D = get2DSignal(
                _correlation1DExtra2D.experimentType,
                _correlation1DExtra2D.atomTypes,
                _indexWithin2DExperiment,
              );
              _correlation1DExtra2D.match.push(
                signalsOtherAtomType
                  .map((_signal1D, k) =>
                    checkSignalMatch(
                      _signal1D.signal,
                      _signal2D.signal[otherAxis],
                      otherAtomType,
                    )
                      ? k
                      : -1,
                  )
                  .filter((_matchIndex) => _matchIndex >= 0),
              );
            },
          );
        });

        _correlations[atomType].push({
          ..._signal1D,
          correlation: correlations1DExtra2D,
        });
      });
    });

    // update attachment information between heavy atoms and protons via HSQC or HMQC
    const _correlationsProtons = lodash.get(_correlations, 'H', []);
    if (_correlationsProtons.length > 0) {
      atomTypesInSpectra.total.forEach((atomType) => {
        const _correlationsAtomType = _correlations[atomType];
        if (atomType !== 'H') {
          for (let j = 0; j < _correlationsAtomType.length; j++) {
            const indicesProtons = _correlationsAtomType[j].correlation
              .map((_correlation, n) =>
                _correlation.experimentType === 'hsqc' ||
                _correlation.experimentType === 'hmqc'
                  ? n
                  : -1,
              )
              .filter((_index) => _index >= 0)
              .map((_index) =>
                lodash
                  .get(
                    _correlationsAtomType,
                    `[${j}].correlation[${_index}].match`,
                    [],
                  )
                  .flat(),
              )
              .flat();
            if (indicesProtons.length > 0) {
              attach(
                _correlations,
                _correlationsAtomType,
                j,
                'H',
                indicesProtons,
              );
            }
            indicesProtons.forEach((_index) => {
              attach(_correlations, _correlationsProtons, _index, atomType, [
                j,
              ]);
            });
          }
        }
      });
      let count = 0;
      _correlationsProtons.forEach((_correlationProton) => {
        if (!lodash.get(_correlationProton, 'attached', false)) {
          _correlationProton.label = `HX${count + 1}`;
          count++;
        }
      });
    }

    return _correlations;
  }, [
    atomTypesInSpectra.total,
    attach,
    checkSignalMatch,
    get2DSignal,
    getCorrelationsFor1D,
    signals,
  ]);

  // useEffect(() => {
  //   console.log(correlations);
  // }, [correlations]);

  const getAdditionalColumnsData = useCallback(
    (correlation) => {
      return additionalColumns.map((_experimentType, n) => {
        let content = '';
        if (lodash.get(correlation, 'correlation', false)) {
          correlation.correlation.forEach((_experiment2D) => {
            if (_experiment2D.experimentType === _experimentType) {
              content = _experiment2D.correlation
                .map((_signal2D, m) =>
                  lodash.get(_experiment2D, `match[${m}]`, []),
                )
                .flat()
                .map(
                  (_matchIndex) =>
                    correlations[
                      _experiment2D.atomTypes[
                        _experiment2D.axis === 'x' ? 1 : 0
                      ] // reversed to get the other atom type
                    ][_matchIndex].label,
                )
                .join(', ');
            }
          });
        }
        // eslint-disable-next-line react/no-array-index-key
        return <td key={`addCol_${_experimentType}_${n}`}>{content}</td>;
      });
    },
    [additionalColumns, correlations],
  );

  const buildTableRow = useCallback(
    (correlation, key, styleRow, styleLabel) => {
      return (
        <tr key={key} style={styleRow}>
          <td>
            {lodash.get(correlation, 'experimentType', false)
              ? correlation.experimentType.toUpperCase()
              : ''}
          </td>
          <td style={styleLabel}>{correlation.label}</td>
          <td>
            {lodash.get(correlation, 'signal.delta', false)
              ? correlation.signal.delta.toFixed(3)
              : ''}
          </td>
          <td>{''}</td>
          {getAdditionalColumnsData(correlation)}
        </tr>
      );
    },
    [getAdditionalColumnsData],
  );

  const rows = useMemo(() => {
    const _rows = [];
    const correlationsProtons = lodash.get(correlations, 'H', []);
    Object.keys(atoms).forEach((atomType, i) => {
      const correlationsAtomType = lodash.get(correlations, `${atomType}`, []);
      if (atomType !== 'H') {
        // for all heavy atoms
        for (let j = 0; j < atoms[atomType]; j++) {
          if (
            correlationsAtomType.length > 0 &&
            j < correlationsAtomType.length
          ) {
            const correlation = correlationsAtomType[j];
            _rows.push(
              buildTableRow(
                correlation,
                `correlation${i}${j}${correlation.signal.delta}`,
                { backgroundColor: 'mintcream' },
              ),
            );
            lodash.get(correlation, 'attached.H', []).forEach((_index, h) => {
              const correlationProton = correlationsProtons[_index];
              _rows.push(
                buildTableRow(
                  correlationProton,
                  `correlation${i}${j}_proton${h}`,
                ),
              );
            });
          } else {
            // add placeholder rows for missing atoms
            _rows.push(
              buildTableRow(
                {
                  label:
                    correlationsAtomType.length > 0
                      ? `[${atomType}${j + 1}]` // put brackets around label if it is a missing atom
                      : `${atomType}${j + 1}`,
                },
                `placeholder_correlation${i}${j}`,
                { backgroundColor: 'mintcream' },
                {
                  color: correlationsAtomType.length > 0 ? 'red' : 'black', // use red color for label if it is a missing atom
                },
              ),
            );
          }
        }
        if (correlationsAtomType.length > atoms[atomType]) {
          for (let k = atoms[atomType]; k < correlationsAtomType.length; k++) {
            const correlation = correlationsAtomType[k];
            _rows.push(
              buildTableRow(
                correlation,
                `correlation${i}${atoms[atomType] + k + 1}`,
                { backgroundColor: 'mintcream' },
                { color: 'red' },
              ),
            );
            lodash.get(correlation, 'attached.H', []).forEach((_index, h) => {
              const correlationProton = correlationsProtons[_index];
              _rows.push(
                buildTableRow(
                  correlationProton,
                  `correlation${i}${k}_proton${h}`,
                ),
              );
            });
          }
        }
      } else {
        // in case of protons which are not attached
        for (let k = 0; k < correlationsAtomType.length; k++) {
          const correlationProton = correlationsAtomType[k];
          if (!lodash.get(correlationProton, 'attached', false)) {
            _rows.push(
              buildTableRow(
                correlationProton,
                `correlation${i}${atoms[atomType] + k + 1}`,
                { backgroundColor: 'mintcream' },
                { color: 'red' },
              ),
            );
          }
        }
      }

      return _rows;
    });

    return _rows;
  }, [atoms, buildTableRow, correlations]);

  const completenessView = useMemo(() => {
    const line = Object.keys(atoms).map((atom, i) => {
      const _completenessAtom = lodash.get(
        completeness,
        `atomType.${atom}`,
        false,
      );
      return (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={`molFormulaView_${i}`}
          style={{
            color: _completenessAtom
              ? _completenessAtom.complete
                ? 'green'
                : 'red'
              : 'black',
          }}
        >
          {`${atom}: ${_completenessAtom ? _completenessAtom.current : '-'}/${
            atoms[atom]
          }   `}
        </span>
      );
    });
    return line;
  }, [atoms, completeness]);

  return (
    <div>
      {completenessView}
      <table css={tableStyle}>
        <tbody>
          <tr>
            <th>Exp</th>
            <th>Atom</th>
            <th>δ (ppm)</th>
            {/* <th>J (Hz)</th> */}
            <th>Equiv</th>
            {additionalColumns.map((_experiment, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <th key={`expCol_${i}_${_experiment}`}>
                {_experiment.toUpperCase()}
              </th>
            ))}
          </tr>
          {rows}
        </tbody>
      </table>
    </div>
  );
};

export default CorrelationTable;
