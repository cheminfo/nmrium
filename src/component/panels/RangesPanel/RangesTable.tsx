import styled from '@emotion/styled';
import type { Info1D } from '@zakodium/nmr-types';
import type { WorkSpacePanelPreferences } from '@zakodium/nmrium-core';
import { FaLink } from 'react-icons/fa';

import { withDialog } from '../../elements/DialogManager.js';
import { EmptyText } from '../../elements/EmptyText.js';
import type { TableContextMenuProps } from '../../elements/ReactTable/ReactTable.js';
import useTableSortBy from '../../hooks/useTableSortBy.js';
import { EditRangeModal } from '../../modal/editRange/EditRangeModal.js';
import { extractChemicalElement } from '../../utility/extractChemicalElement.js';
import { NoDataForFid } from '../extra/placeholder/NoDataForFid.js';

import type { RangesTableDataRow } from './RangesPanel.js';
import RangesTableRow from './RangesTableRow.js';
import useMapRanges from './hooks/useMapRanges.js';

const Table = styled.table`
  border: 1px solid #dedede;
  border-spacing: 0;
  font-size: 12px;
  width: 100%;

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
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;
    margin: 0;
    padding: 0.1rem 0.4rem;
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
`;

interface RangesTableProps extends TableContextMenuProps {
  preferences: WorkSpacePanelPreferences['ranges'];
  tableData: RangesTableDataRow[];
  activeTab: string;
  info: Info1D;
}

const EditRangeDialog = withDialog(EditRangeModal, { force: true });

export default function RangesTable(props: RangesTableProps) {
  const {
    tableData,
    contextMenu = [],
    onContextMenuSelect,
    activeTab,
    preferences,
    info,
  } = props;

  const { tablePreferences } = preferences;

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
    tablePreferences.showDeleteAction ||
    tablePreferences.showEditAction ||
    tablePreferences.showZoomAction;

  return (
    <>
      <EditRangeDialog />
      <Table>
        <thead>
          <tr>
            {tablePreferences.showSerialNumber && <th>#</th>}
            {tablePreferences.showAssignmentLabel && (
              <th title="Assignment">Assignment</th>
            )}
            {tablePreferences.from.show && (
              <th id="from" {...onSort}>
                From
                {isSortedDesc('from').content}
              </th>
            )}
            {tablePreferences.to.show && (
              <th id="to" {...onSort}>
                To {isSortedDesc('to').content}
              </th>
            )}
            {tablePreferences.deltaPPM.show && (
              <th id="from" {...onSort}>
                δ (ppm) {isSortedDesc('from').content}
              </th>
            )}
            {tablePreferences.deltaHz.show && <th>δ (Hz) </th>}

            {tablePreferences.relative.show && (
              <th id="integration" {...onSort}>
                Rel. {element} {isSortedDesc('integration').content}
              </th>
            )}
            {tablePreferences.absolute.show && <th>Absolute</th>}
            {tablePreferences.showMultiplicity && <th>Mult.</th>}
            {tablePreferences.coupling.show && <th>J (Hz)</th>}

            {tablePreferences.showAssignment && (
              <th title="Assign multiplets">
                <FaLink style={{ fontSize: 10, margin: 'auto' }} />
              </th>
            )}
            {tablePreferences.showKind && <th>Kind</th>}
            {showActions && <th>{''}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((range) => {
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
