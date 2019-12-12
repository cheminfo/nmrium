/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useTable, useSortBy } from 'react-table';

import ReactTableHeaderGroup from './Elements/ReactTableHeaderGroup';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';

const ReactTable = ({ data, columns, highlightedRowStyle }) => {
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
      <thead>
        {headerGroups.map((headerGroup) => (
          <ReactTableHeaderGroup key={headerGroup.key} {...headerGroup} />
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return <ReactTableRow key={row.key} row={row} />;
        })}
      </tbody>
    </table>
  );
};

export default ReactTable;
