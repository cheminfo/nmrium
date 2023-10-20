/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Info2D } from 'nmr-processing';
import { ReactNode } from 'react';
import { FaLink } from 'react-icons/fa';

import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useTableSortBy from '../../hooks/useTableSortBy';
import NoDataForFid from '../extra/placeholder/NoDataForFid';
import NoTableData from '../extra/placeholder/NoTableData';

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
  nucleus: string;
  info: Info2D;
}

function ZonesTable({ tableData, onUnlink, nucleus, info }: ZonesTableProps) {
  const { experiment, isFid } = info;

  const nuclei = nucleus.split(',');
  const data = useMapZones(tableData, { nuclei, experiment });
  const { items: sortedData, isSortedDesc, onSort } = useTableSortBy(data);
  const { deltaPPM: deltaX } = usePanelPreferences('zones', nuclei?.[0]);
  const { deltaPPM: deltaY } = usePanelPreferences('zones', nuclei?.[1]);
  const {
    showSerialNumber,
    showAssignment,
    showKind,
    showDeleteAction,
    showEditAction,
    showZoomAction,
  } = usePanelPreferences('zones', nucleus);

  const showActions = showDeleteAction || showEditAction || showZoomAction;

  if (isFid) {
    return <NoDataForFid />;
  }

  if (!tableData || tableData.length === 0) {
    return <NoTableData />;
  }

  return (
    <div>
      <table css={tableStyle}>
        <thead>
          <tr>
            {showSerialNumber && <th rowSpan={2}>#</th>}
            {(deltaX.show || deltaX.show) && <th colSpan={2}>δ (ppm)</th>}
            {showAssignment && (
              <>
                <th colSpan={2}>
                  <FaLink />
                </th>
                <th colSpan={2}>Σ</th>
              </>
            )}
            {showKind && <th rowSpan={2}>Kind</th>}
            {showActions && <th rowSpan={2}>{''}</th>}
          </tr>
          <tr>
            {deltaX.show && (
              <th id="tableMetaInfo.signal.x.delta" {...onSort}>
                <SurroundedText text="F2">
                  {nuclei[0]}{' '}
                  {isSortedDesc('tableMetaInfo.signal.x.delta').content}
                </SurroundedText>
              </th>
            )}
            {deltaY.show && (
              <th id="tableMetaInfo.signal.y.delta" {...onSort}>
                <SurroundedText text="F1">
                  {nuclei[1]}{' '}
                  {isSortedDesc('tableMetaInfo.signal.y.delta').content}
                </SurroundedText>
              </th>
            )}
            {showAssignment && (
              <>
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
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((rowData, index) => (
            <ZonesTableRow
              rowIndex={index}
              key={`${rowData.tableMetaInfo.id}`}
              rowData={rowData}
              onUnlink={onUnlink}
              nucleus={nucleus}
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
