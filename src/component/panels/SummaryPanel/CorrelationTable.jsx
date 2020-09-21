/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { MF } from 'mf-parser';
import { useMemo, useEffect, useState } from 'react';

import { useChartData } from '../../context/ChartContext';

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
  if (pulse.includes('zg')) {
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
  const [isComplete, setIsComplete] = useState(false);

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

  useEffect(() => {
    console.log(experiments);
  }, [experiments]);

  const additionalColumns = useMemo(
    () =>
      Object.keys(lodash.get(experiments, '2D', [])).filter(
        (_experiment) => !_experiment.toUpperCase().includes('HSQC'),
      ),
    [experiments],
  );

  const rows = useMemo(() => {
    const _MF = new MF(mf);
    const atoms = _MF.getInfo().atoms;
    let count = 0;
    // let _isComplete = false;
    return Object.keys(atoms).map((atomType, i) => {
      if (atomType !== 'H') {
        const _rows = [];
        // const atomCount = atoms[atomType];

        // list of experiments, because one could have more than
        // one spectrum in spectra list for one atom type
        // const experimentsAtomType = lodash
        //   .get(experiments, `1D.1d`, [])
        //   .map((_experiment) =>
        //     _experiment.info.nucleus.split(/\d+/)[1] === atomType &&
        //     lodash.get(_experiment, 'ranges.values', []).length > 0
        //       ? _experiment
        //       : undefined,
        //   )
        //   .filter((_experiment) => _experiment);

        // for now we will use the first occurring matched spectrum only
        // const signals =
        //   experimentsAtomType.length > 0
        //     ? experimentsAtomType[0].ranges.values.filter((_range) =>
        //         _range.signal.some((_signal) => _signal.kind),
        //       )
        //     : [];
        // console.log(signals);

        for (let j = 0; j < atoms[atomType]; j++) {
          _rows.push(
            // eslint-disable-next-line react/no-array-index-key
            <tr key={`atom${i}${j}`}>
              <td>{`${atomType}${count + j + 1}`}</td>
              <td>{''}</td>
              <td>{''}</td>
              <td>{0}</td>
            </tr>,
          );
        }

        count += atoms[atomType];
        return _rows;
      } else {
        return null;
      }
    });
  }, []);

  return (
    <div>
      <p css={{ color: isComplete ? 'green' : 'red' }}>{mf}</p>
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
