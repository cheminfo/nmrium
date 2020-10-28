/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { MF } from 'mf-parser';
import { useMemo, useEffect, useState } from 'react';

import { SignalKindsToInclude } from '../../extra/constants/SignalsKinds';

import CorrelationTableRow from './CorrelationTableRow';
import Overview from './Overview';
import {
  addToExperiments,
  checkSignalMatch,
  getAtomType,
  getLabelStyle,
  setAttachments,
  setCorrelations,
  setMatches,
} from './Utilities';

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

const CorrelationTable = ({ data, mf, tolerance }) => {
  const [additionalColumns, setAdditionalColumns] = useState([]);
  const [atoms, setAtoms] = useState({});
  const [state, setState] = useState({
    complete: false,
    atomType: [],
  });

  useEffect(() => (mf ? setAtoms(new MF(mf).getInfo().atoms) : setAtoms({})), [
    mf,
  ]);

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
          let _experiment = _data.info.experiment;
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

  // general remark for all experiment types:
  // build an array of experiments, because one could have more than
  // one spectrum in spectra list for one atom type or experiment type

  // "plain" 1D experiments containing ranges, i.e. without DEPT etc.
  const experiments1D = useMemo(() => {
    const _experiments1D = {};
    Object.keys(atoms).forEach((atomType) => {
      addToExperiments(experiments, _experiments1D, '1D.1d', true, atomType);
    });

    return _experiments1D;
  }, [atoms, experiments]);

  // "extra" 1D experiments containing ranges, e.g. DEPT
  const experiments1DExtra = useMemo(() => {
    const _experiments1DExtra = {};
    Object.keys(lodash.get(experiments, `1D`, {}))
      .filter((_experimentType) => _experimentType !== '1d') // don't consider "plain" 1D experiments here
      .forEach((_experimentType) => {
        addToExperiments(
          experiments,
          _experiments1DExtra,
          `1D.${_experimentType}`,
          false,
          _experimentType,
        );
      });

    return _experiments1DExtra;
  }, [experiments]);

  // 2D experiments containing zones
  const experiments2D = useMemo(() => {
    const _experiments2D = {};
    Object.keys(lodash.get(experiments, '2D', {})).forEach(
      (_experimentType) => {
        addToExperiments(
          experiments,
          _experiments2D,
          `2D.${_experimentType}`,
          false,
          _experimentType,
        );
      },
    );

    return _experiments2D;
  }, [experiments]);

  const signals1D = useMemo(() => {
    // store valid signals from 1D experiments
    const _signals1D = {};
    Object.keys(atoms).forEach((atomType) => {
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
        let count = 0;
        __signals.forEach((__signal) => {
          if (
            !_signals.some((_signal) =>
              checkSignalMatch(_signal.signal, __signal, 0.0),
            )
          ) {
            _signals.push({
              experimentType: '1d',
              dimension: 1,
              atomTypes: [atomType],
              label: { origin: `${atomType}${count + 1}` },
              signal: __signal,
            });
            count++;
          }
        });

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
      const atomType = getAtomType(
        experiments1DExtra[_experimentType][index].info.nucleus,
      );
      const __signals = experiments1DExtra[_experimentType][index].ranges.values
        .map((_range) =>
          _range.signal.filter((_signal) =>
            SignalKindsToInclude.includes(_signal.kind),
          ),
        )
        .flat();
      let count = 0;
      __signals.forEach((__signal) => {
        if (
          !_signals.some((_signal) =>
            checkSignalMatch(_signal.signal, __signal, 0.0),
          )
        ) {
          _signals.push({
            experimentType: _experimentType,
            dimension: 1,
            atomTypes: [atomType],
            label: { origin: `${_experimentType}${count + 1}` },
            signal: __signal,
          });
          count++;
        }
      });

      if (!lodash.get(_signals1DExtra, `${_experimentType}`, false)) {
        _signals1DExtra[_experimentType] = [];
      }
      _signals1DExtra[_experimentType].push({
        signals: _signals,
        experimentType: _experimentType,
        dimension: 1,
        atomTypes: [atomType],
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
      const atomTypes = experiments2D[_experimentType][
        index
      ].info.nucleus.map((_nucleus) => getAtomType(_nucleus));
      const __signals = experiments2D[_experimentType][index].zones.values
        .map((_zone) =>
          _zone.signal.filter((_signal) =>
            SignalKindsToInclude.includes(_signal.kind),
          ),
        )
        .flat();
      let count = 0;
      __signals.forEach((__signal) => {
        if (
          !_signals.some(
            (_signal) =>
              checkSignalMatch(_signal.signal.x, __signal.x, 0.0) &&
              checkSignalMatch(_signal.signal.y, __signal.y, 0.0),
          )
        ) {
          _signals.push({
            experimentType: _experimentType,
            dimension: 2,
            atomTypes,
            label: { origin: `${_experimentType}${count + 1}` },
            signal: __signal,
          });
          count++;
        }
      });

      if (!lodash.get(_signals2D, `${_experimentType}`, false)) {
        _signals2D[_experimentType] = [];
      }
      _signals2D[_experimentType].push({
        signals: _signals,
        experimentType: _experimentType,
        dimension: 2,
        atomTypes,
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

    return atomTypes1D
      .concat(atomTypes1DExtra)
      .concat(atomTypes2D)
      .filter((_atomType, i, a) => a.indexOf(_atomType) === i);
  }, [signals1D, signals1DExtra, signals2D]);

  // signals to use as match reference in correlations variable
  const correlations = useMemo(() => {
    const _signals = {};
    // add all 1D signals
    atomTypesInSpectra.forEach((atomType) => {
      if (lodash.get(signals1D, `${atomType}`, false)) {
        _signals[atomType] = lodash
          .cloneDeep(signals1D[atomType])
          .map((signal, i) => {
            return { ...signal, correlation: [], index: i };
          });
      }
    });

    // add signals from 2D if 1D signals for an atom type are missing
    // add correlations: 1D -> 2D
    setCorrelations(_signals, signals2D, tolerance);

    // link signals via matches to same 2D signal: e.g. 13C -> HSQC <- 1H
    setMatches(_signals);

    // set attachments via HSQC or HMQC
    setAttachments(_signals, atomTypesInSpectra);

    return _signals;
  }, [atomTypesInSpectra, signals1D, signals2D, tolerance]);

  useEffect(() => {
    const _state = { atomType: {} };

    atomTypesInSpectra.forEach((atomType) => {
      const signalsAtomType = lodash.get(correlations, `${atomType}`, []);
      const atomCount = atoms[atomType];
      _state.atomType[atomType] = {
        current: signalsAtomType.length,
        total: atomCount,
        complete: signalsAtomType.length === atomCount ? true : false,
      };
      const createErrorProperty = () => {
        if (!lodash.get(_state, `atomType.${atomType}.error`, false)) {
          _state.atomType[atomType].error = {};
        }
      };
      if (atomType === 'H') {
        const attached = signalsAtomType
          .filter((signal) => lodash.get(signal, 'attached', false))
          .map((signal) => signal.index);
        const notAttached = signalsAtomType
          .filter((signal) => !lodash.get(signal, 'attached', false))
          .map((signal) => signal.index);
        if (notAttached.length > 0) {
          createErrorProperty();
          _state.atomType[atomType].error.notAttached = notAttached;
        }
        const outOfLimit = notAttached
          .filter(
            (signal, count) => count >= Math.abs(attached.length - atomCount),
          )
          .map((index) => index);
        if (outOfLimit.length > 0) {
          createErrorProperty();
          _state.atomType[atomType].error.outOfLimit = outOfLimit;
        }
        const ambiguousAttachment = signalsAtomType
          .filter(
            (signal) =>
              lodash.get(signal, 'attached', false) &&
              (Object.keys(signal.attached).length > 1 ||
                Object.keys(signal.attached).some(
                  (otherAtomType) => signal.attached[otherAtomType].length > 1,
                )),
          )
          .map((signal) => signal.index);
        if (ambiguousAttachment.length > 0) {
          createErrorProperty();
          _state.atomType[
            atomType
          ].error.ambiguousAttachment = ambiguousAttachment;
        }
      } else {
        const outOfLimit = signalsAtomType
          .filter((signal, count) => count >= atomCount)
          .map((signal) => signal.index);
        if (outOfLimit.length > 0) {
          createErrorProperty();
          _state.atomType[atomType].error.outOfLimit = outOfLimit;
        }
      }
    });

    setState(_state);
  }, [atomTypesInSpectra, atoms, correlations]);

  const rows = useMemo(() => {
    const _rows = [];
    const correlationsProtons = lodash.get(correlations, 'H', []);
    Object.keys(atoms).forEach((atomType) => {
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
              <CorrelationTableRow
                additionalColumns={additionalColumns}
                correlations={correlations}
                correlation={correlation}
                rowKey={`correlation${atomType}${correlation.index}`}
                styleRow={{ backgroundColor: 'mintcream' }}
                styleLabel={getLabelStyle(state, correlation)}
              />,
            );
            lodash.get(correlation, 'attached.H', []).forEach((_index) => {
              const correlationProton = correlationsProtons[_index];
              _rows.push(
                <CorrelationTableRow
                  additionalColumns={additionalColumns}
                  correlations={correlations}
                  correlation={correlationProton}
                  rowKey={`correlation${atomType}${correlationProton.index}_${correlation.index}`}
                  styleRow={{ backgroundColor: 'white' }}
                  styleLabel={getLabelStyle(state, correlationProton)}
                />,
              );
            });
          } else {
            const pseudoCorrelation = {
              label: {
                origin:
                  correlationsAtomType.length > 0
                    ? `[${atomType}${j + 1}]` // put brackets around label if it is a missing atom
                    : `${atomType}${j + 1}`,
              },
              atomTypes: [atomType],
            };
            // add placeholder rows for missing atoms
            _rows.push(
              <CorrelationTableRow
                additionalColumns={additionalColumns}
                correlations={correlations}
                correlation={pseudoCorrelation}
                rowKey={`placeholder_correlation$_${_rows.length}`}
                styleRow={{ backgroundColor: 'mintcream' }}
                styleLabel={getLabelStyle(state, pseudoCorrelation)}
              />,
            );
          }
        }
        if (correlationsAtomType.length > atoms[atomType]) {
          for (let k = atoms[atomType]; k < correlationsAtomType.length; k++) {
            const correlation = correlationsAtomType[k];
            _rows.push(
              <CorrelationTableRow
                additionalColumns={additionalColumns}
                correlations={correlations}
                correlation={correlation}
                rowKey={`correlation${atomType}${correlation.index}`}
                styleRow={{ backgroundColor: 'mintcream' }}
                styleLabel={getLabelStyle(state, correlation)}
              />,
            );
            lodash.get(correlation, 'attached.H', []).forEach((_index) => {
              const correlationProton = correlationsProtons[_index];
              _rows.push(
                <CorrelationTableRow
                  additionalColumns={additionalColumns}
                  correlations={correlations}
                  correlation={correlationProton}
                  rowKey={`correlation${atomType}${correlationProton.index}_${correlation.index}`}
                  styleRow={{ backgroundColor: 'white' }}
                  styleLabel={getLabelStyle(state, correlationProton)}
                />,
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
              <CorrelationTableRow
                additionalColumns={additionalColumns}
                correlations={correlations}
                correlation={correlationProton}
                rowKey={`correlation${atomType}${correlationProton.index}`}
                styleRow={{ backgroundColor: 'mintcream' }}
                styleLabel={getLabelStyle(state, correlationProton)}
              />,
            );
          }
        }
      }

      return _rows;
    });

    return _rows;
  }, [additionalColumns, atoms, correlations, state]);

  return (
    <div>
      <Overview atoms={atoms} state={state} />
      <table css={tableStyle}>
        <tbody>
          <tr>
            <th>Exp</th>
            <th>Atom</th>
            <th>δ (ppm)</th>
            <th>Equiv</th>
            {additionalColumns.map((_experiment) => (
              <th key={`expCol_${_experiment}`}>{_experiment.toUpperCase()}</th>
            ))}
          </tr>
          {rows}
        </tbody>
      </table>
    </div>
  );
};

export default CorrelationTable;
