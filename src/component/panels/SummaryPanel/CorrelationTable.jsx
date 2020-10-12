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
    return { C: 0.4, H: 0.03 };
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

  // all experiments
  const experiments = useMemo(() => {
    const _experiments = {};
    if (data) {
      data
        .filter(
          (_data) =>
            _data.info.isFid === false && _data.display.isVisible === true,
        )
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
          return _experiment.info.nucleus.split(/\d+/)[1] === atomType &&
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

  // // "extra" 1D experiments containing ranges, e.g. DEPT
  // const experiments1DExtra = useMemo(() => {
  //   const _experiments1DExtra = {};
  //   Object.keys(lodash.get(experiments, `1D`, {}))
  //     .filter((_experimentType) => _experimentType !== '1d') // don't consider "plain" 1D experiments here
  //     .forEach((_experimentType) => {
  //       // list of experiments, because one could have more than
  //       // one spectrum in spectra list for the current experiment type
  //       const _experimentsExtra = experiments['1D'][_experimentType]
  //         .map((_experiment) =>
  //           lodash.get(_experiment, 'ranges.values', []).length > 0
  //             ? _experiment
  //             : undefined,
  //         )
  //         .filter((_experiment) => _experiment);
  //       if (_experimentsExtra.length > 0) {
  //         _experiments1DExtra[`${_experimentType}`] = _experimentsExtra;
  //       }
  //     });

  //   return _experiments1DExtra;
  // }, [experiments]);

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

  // useEffect(() => {
  //   console.log(experiments);
  //   console.log(experiments1D);
  //   console.log(experiments1DExtra);
  //   console.log(experiments2D);
  // }, [experiments, experiments1D, experiments1DExtra, experiments2D]);

  // search for matches in extra 1D (e.g. DEPT) and 2D experiments
  const getCorrelationsFor1D = useCallback(
    (signal, atomType, tolerance) => {
      const _correlations = [];
      // @TODO check for information from extra 1D data too, e.g. DEPT
      // Object.keys(experiments1DExtra).forEach((_experimentType) => {
      //   console.log(_experimentType);
      // });
      Object.keys(experiments2D).forEach((_experimentType) => {
        // for now, use first occurring experiment only (index)
        const index = 0;
        const _experiment = experiments2D[_experimentType][index];
        const dim = _experiment.info.nucleus.findIndex(
          (_nucleus) => _nucleus.split(/\d+/)[1] === atomType,
        );
        const axis = dim === 0 ? 'x' : dim === 1 ? 'y' : undefined;
        const matchedSignals = axis
          ? _experiment.zones.values
              .map((_zone) =>
                _zone.signal.filter(
                  (_signal) =>
                    SignalKindsToInclude.includes(_signal.kind) &&
                    signal.delta - tolerance <= _signal[axis].delta &&
                    _signal[axis].delta <= signal.delta + tolerance,
                ),
              )
              .flat()
          : [];
        if (matchedSignals.length > 0) {
          _correlations.push({
            experiment: _experimentType,
            index,
            axis,
            nucleus: _experiment.info.nucleus,
            correlation: matchedSignals,
          });
        }
      });

      return _correlations;
    },
    [experiments2D],
  );

  const correlations = useMemo(() => {
    const _completeness = { complete: false, atomType: {} };
    const signals1D = {};
    Object.keys(atoms).forEach((atomType) => {
      const atomCount = atoms[atomType];

      let _signals = [];
      // store valid signals for 1D experiments
      if (lodash.get(experiments1D, `${atomType}`, []).length > 0) {
        // @TODO for now we will use the first occurring matched spectrum only
        const __signals = experiments1D[`${atomType}`][0].ranges.values
          .map((_range) =>
            _range.signal.filter((_signal) =>
              SignalKindsToInclude.includes(_signal.kind),
            ),
          )
          .flat();
        __signals.forEach((_signal) =>
          _signals.push({
            experimentType: '1d',
            atomType,
            signal: _signal,
          }),
        );

        _completeness.atomType[`${atomType}`] = {
          current: __signals.length,
          total: atomCount,
          complete: __signals.length === atomCount ? true : false,
        };

        signals1D[atomType] = _signals;
      }
    });

    setCompleteness({
      atomType: _completeness.atomType,
      complete: !Object.keys(_completeness.atomType).some(
        (_atomType) => !_completeness.atomType[`${_atomType}`].complete,
      ),
    });

    const _correlations = {};
    // loop through 1D signals and search for matches in extra 1D (e.g. DEPT) and 2D experiments and link them
    Object.keys(signals1D).forEach((atomType) => {
      _correlations[atomType] = signals1D[atomType].map((_signal) => {
        const correlation2D = getCorrelationsFor1D(
          _signal.signal,
          atomType,
          tolerance[atomType],
        ); // incl. equivalences (?)}})

        // now try to find again the 2D signal match (other axis) in the 1D signal list
        const matchIndices = correlation2D.map((_correlation2D) => {
          const otherAxis = _correlation2D.axis === 'x' ? 'y' : 'x';
          const otherNucleus =
            _correlation2D.nucleus[otherAxis === 'x' ? 0 : 1];
          const otherAtomType = otherNucleus.split(/\d+/)[1];
          return _correlation2D.correlation.map((signalMatch2D) =>
            lodash
              .get(signals1D, `${otherAtomType}`, [])
              .map((_signal1D, k) =>
                _signal1D.signal.delta - tolerance[otherAtomType] <=
                  signalMatch2D[otherAxis].delta &&
                signalMatch2D[otherAxis].delta <=
                  _signal1D.signal.delta + tolerance[otherAtomType]
                  ? k
                  : -1,
              )
              .filter((matchIndex) => matchIndex >= 0),
          );
        });
        correlation2D.matchIndices = matchIndices;

        return {
          ..._signal,
          correlation: correlation2D,
        };
      });
    });

    return _correlations;
  }, [atoms, experiments1D, getCorrelationsFor1D, tolerance]);

  // useEffect(() => {
  //   console.log(correlations);
  // }, [correlations]);

  const rows = useMemo(() => {
    const _rows = [];
    Object.keys(atoms).forEach((atomType, i) => {
      const _correlations = lodash.get(correlations, `${atomType}`, []);
      // if (atomType !== 'H') {
      for (let j = 0; j < atoms[atomType]; j++) {
        if (_correlations.length > 0 && j < _correlations.length) {
          const correlation = _correlations[j];
          const additionalColumnsData = additionalColumns.map((_experiment) => {
            let content = '';
            correlation.correlation.forEach((_correlation, l) => {
              if (_correlation.experiment === _experiment) {
                content = _correlation.correlation
                  .map((_signal2D, m) =>
                    lodash
                      .get(
                        correlation,
                        `correlation.matchIndices[${l}][${m}]`,
                        [],
                      )
                      .map((matchIndex) => matchIndex + 1),
                  )
                  .flat()
                  .join(', ');
              }
            });
            // eslint-disable-next-line react/no-array-index-key
            return <td key={`addCol_${atomType}_${i}_${j}`}>{content}</td>;
          });

          _rows.push(
            // eslint-disable-next-line react/no-array-index-key
            <tr key={`correlation${i}${j}`}>
              <td>{`${atomType}${j + 1}`}</td>
              <td>{correlation.signal.delta.toFixed(3)}</td>
              {/* <td>{JSON.stringify(_signal.j)}</td> */}
              <td>{''}</td>
              {additionalColumnsData}
            </tr>,
          );
        } else {
          const additionalColumnsDataDefault = additionalColumns.map(
            // eslint-disable-next-line react/no-array-index-key
            (_column, i) => <td key={`addCol_${atomType}_${i}`}>{''}</td>,
          );
          _rows.push(
            // eslint-disable-next-line react/no-array-index-key
            <tr key={`correlation${i}${j}`}>
              <td
                style={{
                  color: _correlations.length > 0 ? 'red' : 'black',
                }}
              >{`${atomType}${j + 1}`}</td>
              <td>{''}</td>
              {/* <td>{''}</td> */}
              <td>{''}</td>
              {additionalColumnsDataDefault}
            </tr>,
          );
        }
      }
      if (_correlations.length > atoms[atomType]) {
        for (let k = atoms[atomType]; k < _correlations.length; k++) {
          const correlation = _correlations[k];
          const additionalColumnsData = additionalColumns.map((_experiment) => {
            let content = '';
            correlation.correlation.forEach((_correlation, l) => {
              if (_correlation.experiment === _experiment) {
                content = _correlation.correlation
                  .map((_signal2D, m) =>
                    lodash
                      .get(
                        correlation,
                        `correlation.matchIndices[${l}][${m}]`,
                        [],
                      )
                      .map((matchIndex) => matchIndex + 1),
                  )
                  .flat()
                  .join(', ');
              }
            });
            // eslint-disable-next-line react/no-array-index-key
            return <td key={`addCol_${atomType}_${i}_${k}`}>{content}</td>;
          });
          _rows.push(
            // eslint-disable-next-line react/no-array-index-key
            <tr key={`correlation${i}${atoms[atomType] + k + 1}`}>
              <td style={{ color: 'orange' }}>{`[${atomType}${k + 1}]`}</td>
              <td>{_correlations[k].signal.delta.toFixed(3)}</td>
              {/* <td>{''}</td> */}
              <td>{''}</td>
              {additionalColumnsData}
            </tr>,
          );
        }
      }
      // }

      return _rows;
    });

    return _rows;
  }, [additionalColumns, atoms, correlations]);

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
