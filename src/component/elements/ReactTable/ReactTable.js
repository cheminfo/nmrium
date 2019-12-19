/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useTable, useSortBy } from 'react-table';

import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';

const ReactTable = ({ data, columns, type }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
  );
  return (
    <table {...getTableProps()} css={ReactTableStyle}>
      <ReactTableHeader headerGroups={headerGroups} />
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <ReactTableRow
              key={row.key}
              row={row}
              type={type}
              {...row.getRowProps()}
            />
          );
        })}
      </tbody>
    </table>
  );
};

export default ReactTable;
