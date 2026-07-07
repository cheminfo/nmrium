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
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { memo, useEffect, useMemo } from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

import type {
  HighlightEventSource,
  HighlightEventSourceExtra,
  HighlightEventSourceType,
} from '../../highlight/index.js';
import { useHighlight } from '../../highlight/index.js';
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

export type HighlightSourceProps = {
  [K in HighlightEventSourceType]: HighlightEventSourceExtra<K> extends never
    ? { highlightedSource?: K; getHighlightExtra?: never }
    : {
        highlightedSource: K;
        getHighlightExtra: (row: any) => HighlightEventSourceExtra<K>;
      };
}[HighlightEventSourceType];

interface BaseTanStackTableProps<TData extends RowData> {
  data: TData[];
  columns: Array<TanStackTableColumn<TData, any>>;
  emptyDataRowText?: string;
  rowStyle?:
    | TanStackTableRowStyle
    | ((data: TData) => TanStackTableRowStyle | undefined);
  style?: CSSObject | SerializedStyles;
  disableDefaultRowStyle?: boolean;
}

type TanStackTableProps<TData extends RowData> = BaseTanStackTableProps<TData> &
  HighlightSourceProps;

const sortIconStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: '2px',
};

function getRowStyle(
  isActive: boolean,
  rowStyle: TanStackTableRowStyle = {},
  disableDefaultRowStyle?: boolean,
): SerializedStyles {
  const { hover = {}, active = {}, base = {}, activated = {} } = rowStyle;

  const hoverStyle = disableDefaultRowStyle
    ? (hover as CSSObject)
    : { backgroundColor: '#ff6f0091', ...hover };
  const activeStyle = disableDefaultRowStyle
    ? (active as CSSObject)
    : { backgroundColor: '#ff6f0070', ...active };
  const baseStyle = disableDefaultRowStyle
    ? (base as CSSObject)
    : { backgroundColor: 'white', ...base };

  return css([
    {
      ...baseStyle,
      ...(isActive && { backgroundColor: '#ff6f0070', ...activated }),
    },
    { ':hover': hoverStyle, ':active': activeStyle },
  ]);
}

function getIDs(rowData: RowData): string[] {
  const id = (rowData as { id?: unknown }).id;
  if (id) {
    if (Array.isArray(id)) {
      return id.flatMap((value) =>
        typeof value === 'string' || typeof value === 'number'
          ? [String(value)]
          : [],
      );
    }
    if (typeof id === 'string' || typeof id === 'number') {
      return [String(id)];
    }
  }
  return [''];
}

type TanStackTableRowProps<TData extends RowData> = {
  children: ReactNode;
  disableDefaultRowStyle?: boolean;
  rowData: TData;
  rowStyle: TanStackTableRowStyle | undefined;
  rowKey: string;
} & HighlightSourceProps;

function TanStackTableRow<TData extends RowData>(
  props: TanStackTableRowProps<TData>,
) {
  const {
    children,
    disableDefaultRowStyle,
    getHighlightExtra,
    highlightedSource = 'UNKNOWN',
    rowData,
    rowKey,
    rowStyle,
  } = props;

  const data = useMemo(
    (): HighlightEventSource =>
      ({
        type: highlightedSource,
        extra: getHighlightExtra?.(rowData),
      }) as HighlightEventSource,
    [getHighlightExtra, highlightedSource, rowData],
  );
  const highlight = useHighlight(getIDs(rowData), data);

  useEffect(() => {
    return () => {
      highlight.hide();
    };
    // Keep this cleanup aligned with the legacy ReactTable row behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <tr
      key={rowKey}
      css={getRowStyle(highlight.isActive, rowStyle, disableDefaultRowStyle)}
      {...highlight.onHover}
    >
      {children}
    </tr>
  );
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
    highlightedSource,
    getHighlightExtra,
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
              <TanStackTableRow
                key={row.id}
                rowKey={row.id}
                rowData={row.original}
                rowStyle={currentRowStyle}
                disableDefaultRowStyle={disableDefaultRowStyle}
                {...({
                  highlightedSource,
                  getHighlightExtra,
                } as HighlightSourceProps)}
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
              </TanStackTableRow>
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
