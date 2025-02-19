import type { CSSProperties } from 'react';
import { useFlexLayout, useSortBy, useTable } from 'react-table';

import { BaseReactTable } from './BaseReactTable.js';

interface ReactTableFlexLayoutProps {
  data: any;
  columns: any;
  onMouseDown?: () => void;
  style?: CSSProperties;
}

function ReactTableFlexLayout({
  data,
  columns,
  onMouseDown = () => null,
  style = {},
}: ReactTableFlexLayoutProps) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
      },
      useSortBy,
      useFlexLayout,
    );

  return (
    <BaseReactTable {...getTableProps()} style={{ height: '100%', ...style }}>
      <thead>
        {headerGroups.map((headerGroup) => {
          const { key: headerGroupKey, ...restHeaderGroupProps } =
            headerGroup.getHeaderGroupProps();
          return (
            <tr key={headerGroupKey} {...restHeaderGroupProps}>
              {headerGroup.headers.map((column: any) => {
                const { key: headerKey, ...restHeaderProps } =
                  column.getHeaderProps(column?.getSortByToggleProps());
                return (
                  <th key={headerKey} {...restHeaderProps}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' ▼'
                          : ' ▲'
                        : ''}
                    </span>
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody
        {...getTableBodyProps()}
        style={{ display: 'block', height: '100%', overflowY: 'auto' }}
      >
        {rows.map((row) => {
          prepareRow(row);
          const { key: rowKey, ...resetRowProps } = row.getRowProps();
          return (
            <tr key={rowKey} {...resetRowProps} onMouseDown={onMouseDown}>
              {row.cells.map((cell) => {
                const {
                  key: cellKey,
                  style: cellStyle,
                  ...resetCellProps
                } = cell.getCellProps();
                return (
                  <td
                    key={cellKey}
                    {...resetCellProps}
                    style={{ ...cellStyle, padding: '0px' }}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </BaseReactTable>
  );
}

export default ReactTableFlexLayout;
