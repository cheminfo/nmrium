/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { MF } from 'mf-parser';
import { useMemo, useEffect, useState } from 'react';

import { useChartData } from '../../context/ChartContext';
import { checkRangeKind } from '../extra/utilities/RangeUtilities';

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
    // + udeft ?
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
  const mf = 'C11H14N2O';

  const { data } = useChartData();
  const [completeness, setCompleteness] = useState({
    complete: false,
    atomType: [],
  });

  const atoms = useMemo(() => new MF(mf).getInfo().atoms, [mf]);

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

  useEffect(() => {
    console.log(experiments);
    console.log(experiments1D);
    console.log(experiments1DExtra);
    console.log(experiments2D);
  }, [experiments, experiments1D, experiments1DExtra, experiments2D]);

  const additionalColumns = useMemo(
    () => Object.keys(lodash.get(experiments, '2D', [])),
    [experiments],
  );

  const correlations = useMemo(() => {
    const _completeness = { complete: false, atomType: {} };
    const _correlations = {};
    Object.keys(atoms).forEach((atomType) => {
      const atomCount = atoms[atomType];

      let correlation = [];
      if (lodash.get(experiments1D, `${atomType}`, []).length > 0) {
        // @TODO for now we will use the first occurring matched spectrum only
        const signals = experiments1D[`${atomType}`][0].ranges.values
          .filter((_range) => checkRangeKind(_range))
          .map((_range) => _range.signal)
          .flat();
        signals.forEach((_signal, i) => {
          const _correlation = {
            dimension: 1,
            signal: _signal,
            correlation: [], // incl. equivalences (?)
          };

          if (i < atomCount) {
            correlation.push(_correlation);
          }
        });

        _completeness.atomType[`${atomType}`] = {
          current: signals.length,
          total: atomCount,
          complete: signals.length === atomCount ? true : false,
        };

        _correlations[atomType] = correlation;
      }
    });

    setCompleteness({
      atomType: _completeness.atomType,
      complete: !Object.keys(_completeness.atomType).some(
        (_atomType) => !_completeness.atomType[`${_atomType}`].complete,
      ),
    });

    return _correlations;
  }, [atoms, experiments1D]);

  useEffect(() => {
    console.log(correlations);
  }, [correlations]);

  const rows = useMemo(() => {
    const _rows = [];
    Object.keys(atoms).forEach((atomType, i) => {
      const _correlation = lodash.get(correlations, `${atomType}`, []);
      if (atomType !== 'H') {
        for (let j = 0; j < atoms[atomType]; j++) {
          if (_correlation.length > 0 && j < _correlation.length) {
            _rows.push(
              // eslint-disable-next-line react/no-array-index-key
              <tr key={`correlation${i}${j}`}>
                <td>{`${atomType}${_rows.length + 1}`}</td>
                <td>{_correlation[j].signal.delta.toFixed(3)}</td>
                <td>{''}</td>
                <td>{''}</td>
              </tr>,
            );
          } else {
            _rows.push(
              // eslint-disable-next-line react/no-array-index-key
              <tr key={`correlation${i}${j}`}>
                <td>{`${atomType}${_rows.length + 1}`}</td>
                <td>{''}</td>
                <td>{''}</td>
                <td>{''}</td>
              </tr>,
            );
          }
        }
      }

      return _rows;
    });

    return _rows;
  }, [atoms, correlations]);

  const molFormulaView = useMemo(() => {
    const line = Object.keys(atoms).map((_atom, i) => (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={`molFormulaView_${i}`}
        style={{
          color: completeness.complete ? 'green' : 'red',
        }}
      >
        {`${_atom}: ${'-'}/${atoms[_atom]}   `}
      </span>
    ));
    return line;
  }, [atoms, completeness]);

  return (
    <div>
      {molFormulaView}
      <table css={tableStyle}>
        <tbody>
          <tr>
            <th>Atom</th>
            <th>δ (ppm)</th>
            <th>J (Hz)</th>
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
