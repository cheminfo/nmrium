/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo } from 'react';

import { getLabelColor } from '../Utilities';

import AdditionalColumnHeader from './AdditionalColumnHeader';
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
  correlationsData,
  filteredCorrelationsData,
  additionalColumnData,
  editEquivalencesSaveHandler,
  changeHybridizationSaveHandler,
  editProtonsCountSaveHandler,
  editAdditionalColumnFieldSaveHandler,
  showProtonsAsRows,
  spectraData,
}) {
  const rows = useMemo(() => {
    if (!filteredCorrelationsData) {
      return [];
    }

    return filteredCorrelationsData.values
      .filter((correlation) =>
        showProtonsAsRows
          ? correlation.atomType === 'H'
          : correlation.atomType !== 'H',
      )
      .map((correlation) => (
        <CorrelationTableRow
          additionalColumnData={additionalColumnData}
          correlations={correlationsData.values}
          correlation={correlation}
          key={`correlation${correlation.atomType}${correlation.id}`}
          styleRow={{ backgroundColor: 'mintcream' }}
          styleLabel={
            correlation.atomType === 'H'
              ? {
                  color: getLabelColor(correlationsData, correlation),
                }
              : {}
          }
          onSaveEditEquivalences={editEquivalencesSaveHandler}
          onChangeHybridization={changeHybridizationSaveHandler}
          onSaveEditProtonsCount={editProtonsCountSaveHandler}
          onEditAdditionalColumnField={editAdditionalColumnFieldSaveHandler}
          spectraData={spectraData}
        />
      ));
  }, [
    filteredCorrelationsData,
    showProtonsAsRows,
    additionalColumnData,
    correlationsData,
    editEquivalencesSaveHandler,
    changeHybridizationSaveHandler,
    editProtonsCountSaveHandler,
    editAdditionalColumnFieldSaveHandler,
    spectraData,
  ]);

  const additionalColumnHeader = useMemo(
    () =>
      additionalColumnData.map((correlation) => (
        <AdditionalColumnHeader
          key={`additionalCorrelationHeader_${correlation.id}`}
          spectraData={spectraData}
          correlationsData={correlationsData}
          correlation={correlation}
        />
      )),
    [additionalColumnData, correlationsData, spectraData],
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
