import { Fragment } from 'react';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useTable, useExpanded, useSortBy } from 'react-table';

import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';

const ReactTableExpandable = ({ columns, data, renderRowSubComponent }) => {
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
              <ReactTableRow key={row.key} row={row} {...row.getRowProps()} />
              {row.isExpanded ? (
                <tr>
                  <td colSpan={flatColumns.length}>
                    {row &&
                      row.original &&
                      row.original.id &&
                      renderRowSubComponent({ row })}
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

ReactTableExpandable.defaultProps = {
  renderRowSubComponent: () => {
    return null;
  },
};

export default ReactTableExpandable;
