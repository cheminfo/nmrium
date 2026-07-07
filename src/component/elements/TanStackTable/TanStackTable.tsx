/** @jsxImportSource @emotion/react */
import type { CSSObject, SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import type { CellData, ColumnDef, RowData } from '@tanstack/react-table';
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import type { CSSProperties, ReactElement } from 'react';
import { memo } from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

import { BaseReactTable } from '../ReactTable/BaseReactTable.js';
import { EmptyDataRow } from '../ReactTable/Elements/EmptyDataRow.js';

export interface TanStackTableColumnMeta {
  style?: CSSProperties;
  thStyle?: CSSProperties;
  tdStyle?: CSSProperties;
}

const tanStackTableColumnMeta: TanStackTableColumnMeta = {};

const tanStackTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  columnMeta: tanStackTableColumnMeta,
});

type TanStackTableFeatures = typeof tanStackTableFeatures;

export type TanStackTableColumn<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<TanStackTableFeatures, TData, TValue>;

export type TanStackTableColumnHelper<TData extends RowData> = ReturnType<
  typeof createColumnHelper<TanStackTableFeatures, TData>
>;

export function createTanStackTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<TanStackTableFeatures, TData>();
}

export interface TanStackTableRowStyle {
  active?: CSSProperties;
  activated?: CSSProperties;
  hover?: CSSProperties;
  base?: CSSProperties;
}

interface TanStackTableProps<TData extends RowData> {
  data: TData[];
  columns: Array<TanStackTableColumn<TData, any>>;
  emptyDataRowText?: string;
  rowStyle?:
    | TanStackTableRowStyle
    | ((data: TData) => TanStackTableRowStyle | undefined);
  style?: CSSObject | SerializedStyles;
  disableDefaultRowStyle?: boolean;
}

const sortIconStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: '2px',
};

function getRowStyle(
  rowStyle: TanStackTableRowStyle = {},
  disableDefaultRowStyle?: boolean,
): SerializedStyles {
  const { hover = {}, active = {}, base = {} } = rowStyle;

  const hoverStyle = disableDefaultRowStyle
    ? (hover as CSSObject)
    : { backgroundColor: '#ff6f0091', ...hover };
  const activeStyle = disableDefaultRowStyle
    ? (active as CSSObject)
    : { backgroundColor: '#ff6f0070', ...active };
  const baseStyle = disableDefaultRowStyle
    ? (base as CSSObject)
    : { backgroundColor: 'white', ...base };

  return css([baseStyle, { ':hover': hoverStyle, ':active': activeStyle }]);
}

function TanStackTable<TData extends RowData>(
  props: TanStackTableProps<TData>,
) {
  const {
    data,
    columns,
    emptyDataRowText = 'No Data',
    rowStyle,
    style = {},
    disableDefaultRowStyle = false,
  } = props;

  const table = useTable({
    features: tanStackTableFeatures,
    data,
    columns,
  });

  return (
    <div
      css={css(
        {
          height: '100%',
          overflowY: 'auto',
          position: 'relative',
        },
        style,
      )}
    >
      <BaseReactTable>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta;

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      ...meta?.style,
                      ...meta?.thStyle,
                      height: '1px',
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span style={sortIconStyle}>
                      {header.column.getIsSorted() === 'desc' ? (
                        <FaSortAmountDown />
                      ) : header.column.getIsSorted() === 'asc' ? (
                        <FaSortAmountUp />
                      ) : null}
                    </span>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {data.length === 0 && (
            <EmptyDataRow numColumns={columns.length} text={emptyDataRowText} />
          )}
          {table.getRowModel().rows.map((row) => {
            const currentRowStyle =
              typeof rowStyle === 'function'
                ? rowStyle(row.original)
                : rowStyle;

            return (
              <tr
                key={row.id}
                css={getRowStyle(currentRowStyle, disableDefaultRowStyle)}
              >
                {row.getAllCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;

                  return (
                    <td
                      key={cell.id}
                      style={{
                        ...meta?.style,
                        ...meta?.tdStyle,
                      }}
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </BaseReactTable>
    </div>
  );
}

export default memo(TanStackTable) as <TData extends RowData>(
  props: TanStackTableProps<TData>,
) => ReactElement;
