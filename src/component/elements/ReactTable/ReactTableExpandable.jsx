/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useTable, useExpanded, useSortBy } from 'react-table';
// eslint-disable-next-line no-unused-vars
import React from 'react';

import Style from './Style';

const ReactTableExpandable = ({ columns, data, renderRowSubComponent }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    flatColumns,
    // state: { expanded },
  } = useTable(
    {
      columns,
      data,
    },
    useExpanded,
    useSortBy,
  );

  return (
    <table {...getTableProps()} css={Style}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr
            key={headerGroup.getHeaderGroupProps().key}
            {...headerGroup.getHeaderGroupProps()}
          >
            {headerGroup.headers.map((column) => (
              <th
                key={column.getHeaderProps().key}
                {...column.getHeaderProps(column.getSortByToggleProps())}
              >
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody key={getTableBodyProps().key} {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <>
              <tr key={row.getRowProps().key} {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td key={cell.getCellProps().key} {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
              {row.isExpanded ? (
                <tr>
                  <td colSpan={flatColumns.length}>
                    {renderRowSubComponent({ row })}
                  </td>
                </tr>
              ) : null}
            </>
          );
        })}
      </tbody>
    </table>
  );
};

export default ReactTableExpandable;
