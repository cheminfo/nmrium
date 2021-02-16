/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo } from 'react';

import { getLabelColor } from '../Utilities';

import CorrelationTableRow from './CorrelationTableRow';

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

function CorrelationTable({
  correlationData,
  additionalColumnData,
  editEquivalencesSaveHandler,
  changeHybridizationSaveHandler,
  editProtonsCountSaveHandler,
  editAdditionalColumnFieldSaveHandler,
  showProtonsAsRows,
}) {
  const rows = useMemo(() => {
    if (!correlationData) {
      return [];
    }

    return correlationData.correlations
      .filter((correlation) =>
        showProtonsAsRows
          ? correlation.getAtomType() === 'H'
          : correlation.getAtomType() !== 'H',
      )
      .map((correlation) => (
        <CorrelationTableRow
          additionalColumnData={additionalColumnData}
          correlations={correlationData.correlations}
          correlation={correlation}
          key={`correlation${correlation.getAtomType()}${correlation.getID()}`}
          styleRow={{ backgroundColor: 'mintcream' }}
          styleLabel={
            correlation.getAtomType() === 'H'
              ? {
                  color: getLabelColor(correlationData, correlation),
                }
              : {}
          }
          onSaveEditEquivalences={editEquivalencesSaveHandler}
          onChangeHybridization={changeHybridizationSaveHandler}
          onSaveEditProtonsCount={editProtonsCountSaveHandler}
          onEditAdditionalColumnField={editAdditionalColumnFieldSaveHandler}
        />
      ));
  }, [
    additionalColumnData,
    changeHybridizationSaveHandler,
    correlationData,
    editEquivalencesSaveHandler,
    editProtonsCountSaveHandler,
    editAdditionalColumnFieldSaveHandler,
    showProtonsAsRows,
  ]);

  const additionalColumnHeader = useMemo(
    () =>
      additionalColumnData.map((correlation) => (
        <th
          key={`CorrCol_${correlation.getID()}`}
          style={{ color: getLabelColor(correlationData, correlation) }}
        >
          <div style={{ display: 'block' }}>
            <p>{correlation.getLabel('origin')}</p>
            <p>
              {correlation &&
              correlation.getSignal() &&
              correlation.getSignal().delta
                ? correlation.getSignal().delta.toFixed(3)
                : ''}
            </p>
            <p style={{ fontSize: 8 }}>
              {`${
                correlation.getExperimentType()
                  ? `${correlation.getExperimentType().toUpperCase()}`
                  : ''
              } ${
                correlation.getEquivalences() > 1
                  ? `(${correlation.getEquivalences()})`
                  : ''
              }`}
            </p>
          </div>
        </th>
      )),
    [additionalColumnData, correlationData],
  );

  return (
    <div className="table-container">
      <table css={tableStyle}>
        <thead>
          <tr>
            <th>Exp</th>
            <th>Atom</th>
            <th>δ (ppm)</th>
            <th>Equiv</th>
            <th>#H</th>
            <th style={{ borderRight: '1px solid' }}>Hybrid</th>
            {additionalColumnHeader}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default CorrelationTable;
