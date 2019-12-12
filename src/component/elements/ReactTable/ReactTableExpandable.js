// eslint-disable-next-line no-unused-vars
import React from 'react';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useTable, useExpanded, useSortBy } from 'react-table';

import ReactTableHeaderGroup from './Elements/ReactTableHeaderGroup';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';

const ReactTableExpandable = ({
  columns,
  data,
  renderRowSubComponent,
  dispatchType,
  highlightedRowStyle,
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
      <thead>
        {headerGroups.map((headerGroup) => (
          <ReactTableHeaderGroup key={headerGroup.key} {...headerGroup} />
        ))}
      </thead>
      <tbody key={getTableBodyProps().key} {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <>
              <ReactTableRow
                key={row.key}
                row={row}
                dispatchType={dispatchType}
                highlightedRowStyle={highlightedRowStyle}
              />
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
