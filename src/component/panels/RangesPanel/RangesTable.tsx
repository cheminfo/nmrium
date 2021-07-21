/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodashGet from 'lodash/get';
import { Fragment, useCallback, useRef } from 'react';
import { FaLink } from 'react-icons/fa';

import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import ContextMenu from '../../elements/ContextMenu';
import useTableSortBy from '../../hooks/useTableSortBy';

import RangesTableRow from './RangesTableRow';
import useMapRanges from './useMapRanges';

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

function RangesTable({ tableData, onUnlink, context, activeTab, preferences }) {
  const element = activeTab?.replace(/[0-9]/g, '');
  const contextRef = useRef<any>();
  const { items: sortedData, isSortedDesc, onSort } = useTableSortBy(tableData);
  const data = useMapRanges(sortedData);

  const isVisible = (key) => {
    return lodashGet(preferences, key, false);
  };

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
            {isVisible('showFrom') ? (
              <th id="from" {...onSort}>
                From
                {isSortedDesc('from').content}
              </th>
            ) : null}
            {isVisible('showTo') ? (
              <th id="to" {...onSort}>
                To {isSortedDesc('to').content}
              </th>
            ) : null}
            <th>δ (ppm) </th>

            {isVisible('showRelative') ? (
              <th id="integral" {...onSort}>
                Rel. {element} {isSortedDesc('integral').content}
              </th>
            ) : null}
            {isVisible('showAbsolute') ? <th>Absolute</th> : null}
            <th>Mult.</th>
            <th>J (Hz)</th>
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
