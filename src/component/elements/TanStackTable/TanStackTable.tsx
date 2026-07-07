/** @jsxImportSource @emotion/react */
import type { CSSObject, SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import type {
  CellData,
  ColumnDef,
  ReactTable,
  Row,
  RowData,
} from '@tanstack/react-table';
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import type { CSSProperties, MouseEvent, ReactElement } from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useResizeObserver } from 'react-d3-utils';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

import type {
  HighlightEventSource,
  HighlightEventSourceExtra,
  HighlightEventSourceType,
} from '../../highlight/index.js';
import { useHighlight } from '../../highlight/index.js';
import type { BaseContextMenuProps } from '../ContextMenuBluePrint.js';
import { ContextMenu } from '../ContextMenuBluePrint.js';
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
  activeRow?: (data: Row<TanStackTableFeatures, TData>) => boolean;
  approxItemHeight?: number;
  contextMenu?: BaseContextMenuProps['options'];
  enableVirtualScroll?: boolean;
  emptyDataRowText?: string;
  onClick?: (
    event: MouseEvent,
    data: Row<TanStackTableFeatures, TData>,
  ) => void;
  onContextMenuSelect?: (
    selected: Parameters<BaseContextMenuProps['onSelect']>[0],
    data: TData,
  ) => void;
  onSortEnd?: (data: TData[], isTableSorted?: boolean) => void;
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

const counterStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  margin: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  pointerEvents: 'none',
  textAlign: 'center',
  fontWeight: 'bolder',
  color: 'white',
  fontSize: '1.4em',
  zIndex: 1,
};

function getTableStyle(enableVirtualScroll: boolean): CSSProperties {
  const style: CSSProperties = { tableLayout: 'auto' };

  if (enableVirtualScroll) {
    style.position = 'sticky';
    style.top = 0;
  }

  return style;
}

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
  contextMenu: BaseContextMenuProps['options'];
  disableDefaultRowStyle?: boolean;
  isRowActive: boolean;
  onClick?: (
    event: MouseEvent,
    data: Row<TanStackTableFeatures, TData>,
  ) => void;
  onContextMenuSelect?: (
    selected: Parameters<BaseContextMenuProps['onSelect']>[0],
    data: TData,
  ) => void;
  row: Row<TanStackTableFeatures, TData>;
  rowData: TData;
  rowStyle: TanStackTableRowStyle | undefined;
  rowKey: string;
  table: ReactTable<TanStackTableFeatures, TData>;
} & HighlightSourceProps;

function TanStackTableRow<TData extends RowData>(
  props: TanStackTableRowProps<TData>,
) {
  const {
    contextMenu,
    disableDefaultRowStyle,
    getHighlightExtra,
    highlightedSource = 'UNKNOWN',
    isRowActive,
    onClick,
    onContextMenuSelect,
    row,
    rowData,
    rowKey,
    rowStyle,
    table,
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

  const clickHandler = (event: MouseEvent) => {
    onClick?.(event, row);
  };

  return (
    <ContextMenu
      data={rowData}
      options={contextMenu}
      onSelect={(selected: Parameters<BaseContextMenuProps['onSelect']>[0]) =>
        onContextMenuSelect?.(selected, rowData)
      }
      as="tr"
      style={{ position: 'static' }}
      key={rowKey}
      css={getRowStyle(
        highlight.isActive || isRowActive,
        rowStyle,
        disableDefaultRowStyle,
      )}
      {...highlight.onHover}
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
            onClick={clickHandler}
          >
            <table.FlexRender cell={cell} />
          </td>
        );
      })}
    </ContextMenu>
  );
}

function TanStackTable<TData extends RowData>(
  props: TanStackTableProps<TData>,
) {
  const {
    activeRow,
    approxItemHeight = 40,
    contextMenu = [],
    data,
    columns,
    enableVirtualScroll = false,
    emptyDataRowText = 'No Data',
    onClick,
    onContextMenuSelect,
    onSortEnd,
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
  const rows = table.getRowModel().rows;
  const sorting = table.state.sorting ?? [];
  const isSortedEventTriggered = useRef(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [mRef, { height } = { height: 0 }] = useResizeObserver();

  useEffect(() => {
    if (isSortedEventTriggered.current) {
      // The sorted row model is available after TanStack applies the header click.
      // eslint-disable-next-line react-you-might-not-need-an-effect/no-pass-data-to-parent
      onSortEnd?.(
        rows.map((row) => row.original),
        sorting.length > 0,
      );
      isSortedEventTriggered.current = false;
    }
  }, [onSortEnd, rows, sorting.length]);

  const { rowsData, counterIndex, virtualScrollHeight } = useMemo(() => {
    if (!enableVirtualScroll || !height) {
      return {
        rowsData: rows,
        counterIndex: rows.length,
        virtualScrollHeight: undefined,
      };
    }

    const start = Math.max(0, Math.floor(scrollTop / approxItemHeight) - 2);
    const visibleRowsCount = Math.ceil(height / approxItemHeight) + 4;
    const end = Math.min(rows.length, start + visibleRowsCount);

    return {
      rowsData: rows.slice(start, end),
      counterIndex: end,
      virtualScrollHeight: approxItemHeight * (rows.length + 1),
    };
  }, [approxItemHeight, enableVirtualScroll, height, rows, scrollTop]);

  function scrollHandler(event: React.UIEvent<HTMLDivElement>) {
    if (!enableVirtualScroll) {
      return;
    }

    setScrollTop(event.currentTarget.scrollTop);
  }

  return (
    <div
      ref={mRef}
      css={css(
        {
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative',
        },
        style,
      )}
    >
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          position: 'relative',
        }}
        onScroll={scrollHandler}
      >
        {enableVirtualScroll && (
          <div
            style={{
              height: virtualScrollHeight,
              pointerEvents: 'none',
              position: 'absolute',
              width: '100%',
            }}
          />
        )}
        <BaseReactTable style={getTableStyle(enableVirtualScroll)}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const toggleSortingHandler =
                    header.column.getToggleSortingHandler();

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...meta?.style,
                        ...meta?.thStyle,
                        height: '1px',
                      }}
                      onClick={(event) => {
                        isSortedEventTriggered.current = true;
                        toggleSortingHandler?.(event);
                      }}
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
              <EmptyDataRow
                numColumns={columns.length}
                text={emptyDataRowText}
              />
            )}
            {rowsData.map((row) => {
              const currentRowStyle =
                typeof rowStyle === 'function'
                  ? rowStyle(row.original)
                  : rowStyle;

              return (
                <TanStackTableRow
                  key={row.id}
                  table={table}
                  row={row}
                  rowKey={row.id}
                  rowData={row.original}
                  rowStyle={currentRowStyle}
                  disableDefaultRowStyle={disableDefaultRowStyle}
                  isRowActive={activeRow?.(row) ?? false}
                  contextMenu={contextMenu}
                  onClick={onClick}
                  onContextMenuSelect={onContextMenuSelect}
                  {...({
                    highlightedSource,
                    getHighlightExtra,
                  } as HighlightSourceProps)}
                />
              );
            })}
          </tbody>
        </BaseReactTable>
      </div>
      {enableVirtualScroll && (
        <p
          style={{
            ...counterStyle,
          }}
        >
          {counterIndex} / {rows.length}
        </p>
      )}
    </div>
  );
}

export default memo(TanStackTable) as <TData extends RowData>(
  props: TanStackTableProps<TData>,
) => ReactElement;
