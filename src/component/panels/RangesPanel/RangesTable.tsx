/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { WorkSpacePanelPreferences } from 'nmr-load-save';
import { Info1D } from 'nmr-processing';
import { FaLink } from 'react-icons/fa';

import { TableContextMenuProps } from '../../elements/ReactTable/ReactTable';
import useTableSortBy from '../../hooks/useTableSortBy';
import NoDataForFid from '../extra/placeholder/NoDataForFid';
import NoTableData from '../extra/placeholder/NoTableData';

import RangesTableRow from './RangesTableRow';
import useMapRanges from './hooks/useMapRanges';

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
    top: 0;
    background-color: white;
    z-index: 1;
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
    }
  }

  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }
`;
interface RangesTableProps extends TableContextMenuProps {
  onUnlink: (a: any, b?: any) => void;
  preferences: WorkSpacePanelPreferences['ranges'];
  tableData: any;
  activeTab: string;
  info: Info1D;
}

function RangesTable({
  tableData,
  onUnlink,
  contextMenu = [],
  onContextMenuSelect,
  activeTab,
  preferences,
  info,
}: RangesTableProps) {
  const element = activeTab?.replace(/\d/g, '');
  const { items: sortedData, isSortedDesc, onSort } = useTableSortBy(tableData);
  const data = useMapRanges(sortedData);

  if (info?.isFid) {
    return <NoDataForFid />;
  }

  if (!tableData || tableData.length === 0) {
    return <NoTableData />;
  }

  const showActions =
    preferences.showDeleteAction ||
    preferences.showEditAction ||
    preferences.showZoomAction;
  return (
    <table css={tableStyle}>
      <thead>
        <tr>
          {preferences.showSerialNumber && <th>#</th>}
          {preferences.from.show && (
            <th id="from" {...onSort}>
              From
              {isSortedDesc('from').content}
            </th>
          )}
          {preferences.to.show && (
            <th id="to" {...onSort}>
              To {isSortedDesc('to').content}
            </th>
          )}
          {preferences.deltaPPM.show && <th>δ (ppm) </th>}
          {preferences.deltaHz.show && <th>δ (Hz) </th>}

          {preferences.relative.show && (
            <th id="integration" {...onSort}>
              Rel. {element} {isSortedDesc('integration').content}
            </th>
          )}
          {preferences.absolute.show && <th>Absolute</th>}
          {preferences.showMultiplicity && <th>Mult.</th>}
          {preferences.coupling.show && <th>J (Hz)</th>}
          {preferences.showAssignment && (
            <>
              <th title="Assign multiplets">
                <FaLink style={{ fontSize: 10, margin: 'auto' }} />
              </th>
              <th title="Assign ranges" style={{ minWidth: '50px' }}>
                Σ
              </th>
            </>
          )}
          {preferences.showKind && <th>Kind</th>}
          {showActions && <th>{''}</th>}
        </tr>
      </thead>
      <tbody>
        {data?.map((range) => {
          return (
            <RangesTableRow
              key={range.rowKey}
              rowData={range}
              onUnlink={onUnlink}
              preferences={preferences}
              info={info}
              contextMenu={contextMenu}
              onContextMenuSelect={onContextMenuSelect}
            />
          );
        })}
      </tbody>
    </table>
  );
}

export default RangesTable;
