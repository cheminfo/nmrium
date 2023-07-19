/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { FaLink } from 'react-icons/fa';

import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useTableSortBy from '../../hooks/useTableSortBy';

import ZonesTableRow from './ZonesTableRow';
import { useMapZones } from './hooks/useMapZones';

const tableStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  font-size: 12px;

  .react-contextmenu-wrapper {
    display: contents;
  }

  th {
    position: sticky;
    background-color: white;
    z-index: 2;
  }

  th,
  td {
    white-space: nowrap;
    text-align: center;
    margin: 0;
    padding: 0.1rem 0.4rem;
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;

    :last-child {
      border-right: 0;
    }

    button {
      background-color: transparent;
      border: none;
      padding: 0 5px;
    }
  }

  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }

  thead tr:nth-of-type(1) th {
    top: 0;
  }

  thead tr:nth-of-type(2) th {
    top: 21px;
  }
`;

interface ZonesTableProps {
  tableData: Array<{
    signals: any[];
    tableMetaInfo: any;
    rowIndex: number;
    signalIndex: number;
    id: number;
  }>;
  onUnlink: (
    zoneData: any,
    isOnZoneLevel: any,
    signalIndex: any,
    axis: any,
  ) => void;
  nuclei: string[];
  experiment: string;
}

function ZonesTable({
  tableData,
  onUnlink,
  nuclei,
  experiment,
}: ZonesTableProps) {
  const data = useMapZones(tableData, { nuclei, experiment });
  const { items: sortedData, isSortedDesc, onSort } = useTableSortBy(data);
  const { deltaPPM: deltaX } = usePanelPreferences('zones', nuclei[0]);
  const { deltaPPM: deltaY } = usePanelPreferences('zones', nuclei[1]);

  return (
    <div>
      <table css={tableStyle}>
        <thead>
          <tr>
            <th rowSpan={2}>#</th>
            <th colSpan={2}>δ (ppm)</th>
            <th colSpan={2}>
              <FaLink />
            </th>
            <th colSpan={2}>Σ</th>
            <th rowSpan={2}>Kind</th>
            <th rowSpan={2}>{''}</th>
          </tr>
          <tr>
            <th id="tableMetaInfo.signal.x.delta" {...onSort}>
              <SurroundedText text="F2">
                {nuclei[0]}{' '}
                {isSortedDesc('tableMetaInfo.signal.x.delta').content}
              </SurroundedText>
            </th>
            <th id="tableMetaInfo.signal.y.delta" {...onSort}>
              <SurroundedText text="F1">
                {nuclei[1]}{' '}
                {isSortedDesc('tableMetaInfo.signal.y.delta').content}
              </SurroundedText>
            </th>
            <th>
              <SurroundedText text="F2">{nuclei[0]}</SurroundedText>
            </th>
            <th>
              <SurroundedText text="F1">{nuclei[1]}</SurroundedText>
            </th>
            <th>
              <SurroundedText text="F2">{nuclei[0]}</SurroundedText>
            </th>
            <th>
              <SurroundedText text="F1">{nuclei[1]}</SurroundedText>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((rowData, index) => (
            <ZonesTableRow
              rowIndex={index}
              key={`${rowData.tableMetaInfo.id}`}
              rowData={rowData}
              onUnlink={onUnlink}
              format={{ x: deltaX.format, y: deltaY.format }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SurroundedText(props: { text: 'F1' | 'F2'; children: ReactNode }) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          fontSize: 8,
          color: '#3539E6',
        }}
      >
        {props.text}
      </div>
      <div style={{ marginLeft: 5 }}>{props.children}</div>
    </>
  );
}

export default ZonesTable;
