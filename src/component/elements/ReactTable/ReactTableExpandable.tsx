/** @jsxImportSource @emotion/react */
import { Fragment, useRef, useCallback } from 'react';
import { useTable, useExpanded, useSortBy } from 'react-table';

import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import ContextMenu from '../ContextMenu';

import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';

interface ReactTableExpandableProps {
  columns: any;
  data: any;
  renderRowSubComponent: (element: any) => void;
  context: Array<{ label: string; onClick: () => void }> | null;
}

function ReactTableExpandable({
  columns,
  data,
  renderRowSubComponent = () => null,
  context = null,
}: ReactTableExpandableProps) {
  const contextRef = useRef<any>(null);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    flatColumns,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useExpanded,
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
    <table {...getTableProps()} css={ReactTableStyle}>
      <ReactTableHeader headerGroups={headerGroups} />
      <tbody key={getTableBodyProps().key} {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <Fragment key={row.index}>
              <ReactTableRow
                key={row.key}
                row={row}
                {...row.getRowProps()}
                onContextMenu={(e) => contextMenuHandler(e, row)}
              />
              {row.isExpanded ? (
                <tr>
                  <td colSpan={flatColumns.length}>
                    {row?.original?.id && renderRowSubComponent({ row })}
                  </td>
                </tr>
              ) : null}
              <ContextMenu ref={contextRef} context={context} />
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

export default ReactTableExpandable;
