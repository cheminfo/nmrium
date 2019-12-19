import { Fragment } from 'react';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useTable, useExpanded, useSortBy } from 'react-table';

import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';

const ReactTableExpandable = ({
  columns,
  data,
  renderRowSubComponent,
  type,
}) => {
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
    useExpanded,
    useSortBy,
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
                type={type}
                {...row.getRowProps()}
              />
              {row.isExpanded ? (
                <tr>
                  <td colSpan={flatColumns.length}>
                    {renderRowSubComponent({ row })}
                  </td>
                </tr>
              ) : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default ReactTableExpandable;
