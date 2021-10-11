/** @jsxImportSource @emotion/react */
import { Fragment, useRef, useCallback, memo } from 'react';
import { useTable, useSortBy } from 'react-table';

import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import ContextMenu from '../ContextMenu';

import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';
import useRowSpan, { prepareRowSpan } from './utility/useRowSpan';

interface ReactTableProps {
  data: any;
  columns: any;
  context?: Array<{ label: string; onClick: () => void }> | null;
}

function ReactTable({ data, columns, context = null }: ReactTableProps) {
  const contextRef = useRef<any>(null);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    rowSpanHeaders,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useRowSpan,
  );
  const contextMenuHandler = useCallback(
    (e, row) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
        contextRef.current.handleContextMenu(e, row.original);
      }
    },
    [contextRef],
  );

  return (
    <Fragment>
      <table {...getTableProps()} css={ReactTableStyle}>
        <ReactTableHeader headerGroups={headerGroups} />
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            prepareRowSpan(rows, index, rowSpanHeaders);

            return (
              <ReactTableRow
                key={row.key}
                row={row}
                {...row.getRowProps()}
                onContextMenu={(e) => contextMenuHandler(e, row)}
              />
            );
          })}
        </tbody>
      </table>
      <ContextMenu ref={contextRef} context={context} />
    </Fragment>
  );
}

export default memo(ReactTable);
