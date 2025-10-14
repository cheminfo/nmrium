import styled from '@emotion/styled';
import type { Spectrum } from '@zakodium/nmrium-core';
import type { Correlation, CorrelationData } from 'nmr-correlation';
import { useMemo } from 'react';

import { getLabelColor } from '../utilities/Utilities.js';

import type { AdditionalColumnHeaderProps } from './AdditionalColumnHeader.js';
import AdditionalColumnHeader from './AdditionalColumnHeader.js';
import CorrelationTableRow from './CorrelationTableRow.js';

const Container = styled.div`
  display: block;
  height: 100%;
  overflow: auto;

  table {
    border: 1px solid #dedede;
    border-spacing: 0;
    font-size: 12px;
    height: 100%;
    width: 100%;
  }

  th {
    position: sticky;
    top: 0;
    background-color: white;
  }

  th,
  td {
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;
    margin: 0;
    padding: 0.4rem;
    text-align: center;
    white-space: nowrap;

    :last-child {
      border-right: 0;
    }

    button {
      background-color: transparent;
      border: none;
    }
  }

  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }

  thead tr {
    background-color: white !important;
  }
`;

interface CorrelationTableProps {
  correlationsData: CorrelationData;
  filteredCorrelationsData: any;
  additionalColumnData: Correlation[];
  editEquivalencesSaveHandler: (
    correlation: Correlation,
    value: number,
  ) => void;
  onSaveEditNumericValues: (params: {
    correlation: Correlation;
    values: number[];
    key: 'hybridization' | 'protonsCount';
  }) => void;
  onEditCorrelationTableCellHandler: AdditionalColumnHeaderProps['onEdit'];
  showProtonsAsRows: boolean;
  spectraData: Spectrum[];
}

export default function CorrelationTable(props: CorrelationTableProps) {
  const {
    correlationsData,
    filteredCorrelationsData,
    additionalColumnData,
    editEquivalencesSaveHandler,
    onSaveEditNumericValues,
    onEditCorrelationTableCellHandler,
    showProtonsAsRows,
    spectraData,
  } = props;
  const rows = useMemo(() => {
    if (!filteredCorrelationsData) {
      return [];
    }

    return filteredCorrelationsData.values
      .filter((correlation: Correlation) =>
        showProtonsAsRows
          ? correlation.atomType === 'H'
          : correlation.atomType !== 'H',
      )
      .map((correlation: Correlation) => (
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
          onSaveEditNumericValues={onSaveEditNumericValues}
          onEditCorrelationTableCellHandler={onEditCorrelationTableCellHandler}
          spectraData={spectraData}
        />
      ));
  }, [
    filteredCorrelationsData,
    showProtonsAsRows,
    additionalColumnData,
    correlationsData,
    editEquivalencesSaveHandler,
    onSaveEditNumericValues,
    onEditCorrelationTableCellHandler,
    spectraData,
  ]);

  const additionalColumnHeader = useMemo(
    () =>
      additionalColumnData.map((correlation: Correlation) => (
        <AdditionalColumnHeader
          key={`additionalCorrelationHeader_${correlation.id}`}
          spectraData={spectraData}
          correlationsData={correlationsData}
          correlation={correlation}
          onEdit={onEditCorrelationTableCellHandler}
        />
      )),
    [
      additionalColumnData,
      correlationsData,
      onEditCorrelationTableCellHandler,
      spectraData,
    ],
  );

  return (
    <Container>
      <table>
        <thead>
          <tr>
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
    </Container>
  );
}
