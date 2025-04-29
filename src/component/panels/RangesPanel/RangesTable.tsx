import styled from '@emotion/styled';
import type { WorkSpacePanelPreferences } from '@zakodium/nmrium-core';
import type { Info1D } from 'nmr-processing';
import { FaLink } from 'react-icons/fa';

import { withDialog } from '../../elements/DialogManager.js';
import { EmptyText } from '../../elements/EmptyText.js';
import type { TableContextMenuProps } from '../../elements/ReactTable/ReactTable.js';
import useTableSortBy from '../../hooks/useTableSortBy.js';
import { EditRangeModal } from '../../modal/editRange/EditRangeModal.js';
import { extractChemicalElement } from '../../utility/extractChemicalElement.js';
import { NoDataForFid } from '../extra/placeholder/NoDataForFid.js';

import RangesTableRow from './RangesTableRow.js';
import useMapRanges from './hooks/useMapRanges.js';

const Table = styled.table`
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
  preferences: WorkSpacePanelPreferences['ranges'];
  tableData: any;
  activeTab: string;
  info: Info1D;
}

const EditRangeDialog = withDialog(EditRangeModal, { force: true });

function RangesTable({
  tableData,
  contextMenu = [],
  onContextMenuSelect,
  activeTab,
  preferences,
  info,
}: RangesTableProps) {
  const element = extractChemicalElement(activeTab);
  const { items: sortedData, isSortedDesc, onSort } = useTableSortBy(tableData);
  const data = useMapRanges(sortedData);

  if (info?.isFid) {
    return <NoDataForFid />;
  }

  if (!tableData || tableData.length === 0) {
    return <EmptyText text="No data" />;
  }

  const showActions =
    preferences.showDeleteAction ||
    preferences.showEditAction ||
    preferences.showZoomAction;

  return (
    <>
      <EditRangeDialog />
      <Table>
        <thead>
          <tr>
            {preferences.showSerialNumber && <th>#</th>}
            {preferences.showAssignmentLabel && (
              <th title="Assignment">Assignment</th>
            )}
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
            {preferences.deltaPPM.show && (
              <th id="from" {...onSort}>
                δ (ppm) {isSortedDesc('from').content}
              </th>
            )}
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
                preferences={preferences}
                info={info}
                contextMenu={contextMenu}
                onContextMenuSelect={onContextMenuSelect}
              />
            );
          })}
        </tbody>
      </Table>
    </>
  );
}

export default RangesTable;
