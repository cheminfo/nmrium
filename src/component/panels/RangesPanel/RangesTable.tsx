/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Fragment, useCallback, useRef } from 'react';
import { FaLink } from 'react-icons/fa';

import { Info1D } from '../../../data/types/data1d/Info1D';
import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import ContextMenu, { ContextMenuProps } from '../../elements/ContextMenu';
import useTableSortBy from '../../hooks/useTableSortBy';
import { RangesPanelPreferences } from '../../workspaces/Workspace';

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
  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
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
`;
interface RangesTableProps {
  onUnlink: (a: any, b?: any) => void;
  preferences: RangesPanelPreferences;
  tableData: any;
  context: ContextMenuProps['context'];
  activeTab: string;
  info: Info1D;
}

function RangesTable({
  tableData,
  onUnlink,
  context,
  activeTab,
  preferences,
  info,
}: RangesTableProps) {
  const element = activeTab?.replace(/[0-9]/g, '');
  const contextRef = useRef<any>();
  const { items: sortedData, isSortedDesc, onSort } = useTableSortBy(tableData);
  const data = useMapRanges(sortedData);

  const contextMenuHandler = useCallback(
    (e, rowData) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
        contextRef.current.handleContextMenu(e, rowData);
      }
    },
    [contextRef],
  );

  return (
    <Fragment>
      <table css={tableStyle}>
        <thead>
          <tr>
            <th>#</th>
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
            <th>Mult.</th>
            {preferences.coupling.show && <th>J (Hz)</th>}
            <th>
              <FaLink style={{ fontSize: 10 }} />
            </th>
            <th>Σ</th>
            <th>Kind</th>
            <th>{''}</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((range) => {
            return (
              <RangesTableRow
                key={range.rowKey}
                rowData={range}
                onUnlink={onUnlink}
                onContextMenu={(e, rowData) => contextMenuHandler(e, rowData)}
                preferences={preferences}
                info={info}
              />
            );
          })}
        </tbody>
      </table>
      <ContextMenu ref={contextRef} context={context} />
    </Fragment>
  );
}

export default RangesTable;
