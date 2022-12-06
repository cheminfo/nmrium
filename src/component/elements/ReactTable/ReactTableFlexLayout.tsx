/** @jsxImportSource @emotion/react */

import { CSSProperties } from 'react';
import {
  useTable,
  useSortBy,
  useFlexLayout,
  UseSortByOptions,
} from 'react-table';

import { ReactTableStyle } from './Style';

interface ReactTableFlexLayoutProps {
  data: any;
  columns: any;
  onMouseDown?: () => void;
  style?: CSSProperties;
}

export interface TableOptions<D extends Record<string, unknown>>
  extends UseSortByOptions<D> {}

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
    <table
      {...getTableProps()}
      css={ReactTableStyle}
      style={{ height: '100%', ...style }}
    >
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
    </table>
  );
}

export default ReactTableFlexLayout;
