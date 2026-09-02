/** @jsxImportSource @emotion/react */
import type { CSSObject, SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import { useTable } from '@tanstack/react-table';
import type {
  CSSProperties,
  MouseEvent,
  ReactElement,
  Ref,
  UIEvent,
} from 'react';
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useResizeObserver } from 'react-d3-utils';

import { BaseReactTable } from './elements/base_react_table.tsx';
import { EmptyDataRow } from './elements/empty_data_row.tsx';
import {
  TanStackTableProvider,
  useTanStackTableContext,
} from './elements/table_context.ts';
import TableHeader from './elements/table_header.tsx';
import TableRow from './elements/table_row.tsx';
import { tanStackTableFeatures } from './features.ts';
import type {
  TanStackRowData,
  TanStackTableClickEvent,
  TanStackTableColumn,
  TanStackTableContextMenuProps,
  TanStackTableHighlightSourceProps,
  TanStackTableRow,
  TanStackTableRowStyle,
  TanStackTableSortEvent,
  TanStackTableVirtualBoundary,
} from './types.ts';

interface TanStackTableProps<TData extends TanStackRowData>
  extends
    TanStackTableContextMenuProps<TData>,
    TanStackTableClickEvent<TData>,
    TanStackTableSortEvent<TData> {
  data: readonly TData[];
  columns: ReadonlyArray<TanStackTableColumn<TData, any>>;
  approxItemHeight?: number;
  approxColumnWidth?: number;
  groupKey?: keyof TData;
  indexKey?: string;
  enableVirtualScroll?: boolean;
  enableColumnsVirtualScroll?: boolean;
  activeRow?: (data: TanStackTableRow<TData>) => boolean;
  enableDefaultActiveRow?: boolean;
  totalCount?: number;
  emptyDataRowText?: string;
  rowStyle?:
    | TanStackTableRowStyle
    | ((row: TanStackTableRow<TData>) => TanStackTableRowStyle | undefined);
  style?: CSSObject | SerializedStyles;
  disableDefaultRowStyle?: boolean;
  enableCellSpanning?: boolean;
}

type ReactTableInnerProps<TData extends TanStackRowData> =
  TanStackTableProps<TData> &
    TanStackTableHighlightSourceProps<TData> & {
      containerRef: Ref<HTMLDivElement>;
      onScroll?: (event: UIEvent<HTMLDivElement>) => void;
    };

type ReactTableOuterProps<TData extends TanStackRowData> =
  TanStackTableProps<TData> & TanStackTableHighlightSourceProps<TData>;

const styles = {
  table: (
    enableVirtualScroll: boolean,
    enableColumnsVirtualScroll: boolean,
  ): CSSProperties => {
    const style: CSSProperties = { tableLayout: 'auto' };

    if (enableVirtualScroll) {
      style.position = 'sticky';
      style.top = 0;
    }
    if (enableColumnsVirtualScroll) {
      style.position = 'sticky';
      style.left = 0;
    }
    return style;
  },
};

const counterStyle: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  pointerEvents: 'none',
  textAlign: 'center',
  fontWeight: 'bolder',
  color: 'white',
  fontSize: '1.4em',
};

function TanStackTableInner<TData extends TanStackRowData>(
  props: ReactTableInnerProps<TData>,
) {
  const {
    data,
    columns,
    highlightedSource,
    getHighlightExtra,
    contextMenu = [],
    onContextMenuSelect,
    onScroll,
    approxItemHeight = 40,
    enableVirtualScroll = false,
    enableColumnsVirtualScroll = false,
    approxColumnWidth = 40,
    onClick,
    activeRow,
    totalCount,
    indexKey = 'index',
    onSortEnd,
    rowStyle,
    disableDefaultRowStyle = false,
    enableDefaultActiveRow = false,
    emptyDataRowText = 'No Data',
    containerRef,
    enableCellSpanning,
  } = props;

  const isSortedEventTriggered = useRef<boolean>(false);
  const virtualBoundary = useTanStackTableContext();
  const [rowIndex, setRowIndex] = useState<number>();
  const timeoutIdRef = useRef<NodeJS.Timeout>(undefined);
  const [isCounterVisible, setCounterVisibility] = useState(false);

  const memoColumns = useMemo(() => {
    const end =
      virtualBoundary.columns.end === columns.length - 1
        ? virtualBoundary.columns.end + 1
        : virtualBoundary.columns.end;

    return enableColumnsVirtualScroll
      ? columns.slice(virtualBoundary.columns.start, end)
      : columns;
  }, [enableColumnsVirtualScroll, virtualBoundary.columns, columns]);

  const table = useTable({
    features: tanStackTableFeatures,
    data,
    columns: memoColumns,
    enableCellSpanning,
  });

  const sortBy = table.state.sorting;
  const rows = table.getRowModel().rows;

  function clickHandler(event: MouseEvent, row: any) {
    setRowIndex(row.index);
    onClick?.(event, row);
  }

  function scrollHandler(e: UIEvent<HTMLDivElement>) {
    if (enableVirtualScroll) {
      onScroll?.(e);
    }

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      setCounterVisibility(true);
    }

    timeoutIdRef.current = setTimeout(() => {
      setCounterVisibility(false);
    }, 1000);
  }

  useEffect(() => {
    if (isSortedEventTriggered.current) {
      const isTableSorted = sortBy.length > 0;
      const data = rows.map((row) => row.original);
      onSortEnd?.(data, isTableSorted);
      isSortedEventTriggered.current = false;
    }
  }, [onSortEnd, rows, sortBy?.length]);

  function headerClickHandler() {
    isSortedEventTriggered.current = true;
  }

  const end =
    virtualBoundary.rows.end === rows.length - 1
      ? virtualBoundary.rows.end + 1
      : virtualBoundary.rows.end;

  const rowsData = enableVirtualScroll
    ? rows.slice(virtualBoundary.rows.start, end)
    : rows;

  const lastRow = rowsData.at(-1);
  const index = (lastRow?.original as any)?.[indexKey] || lastRow?.index;
  const total = totalCount || data.length;

  const startColumn = columns[virtualBoundary.columns.start]?.header;

  return (
    <>
      <div
        ref={containerRef}
        className="table-container"
        style={{
          overflowY: 'auto',
          ...(enableColumnsVirtualScroll && { overflowX: 'auto' }),
          position: 'relative',
          height: '100%',
        }}
        onScroll={scrollHandler}
      >
        <div
          style={{
            height: enableVirtualScroll
              ? approxItemHeight * (data.length + 1)
              : '100%',
            position: 'absolute',
            width: enableColumnsVirtualScroll
              ? approxColumnWidth * (columns.length + 1)
              : '100%',
            pointerEvents: 'none',
          }}
        />
        <BaseReactTable
          style={styles.table(enableVirtualScroll, enableColumnsVirtualScroll)}
        >
          <TableHeader
            headerGroups={table.getHeaderGroups()}
            table={table}
            onClick={headerClickHandler}
          />
          <tbody>
            {!data ||
              (data?.length === 0 && (
                <EmptyDataRow
                  numColumns={columns.length}
                  text={emptyDataRowText}
                />
              ))}
            {rowsData.map((row, index) => {
              const highlightSourceProps = {
                highlightedSource,
                getHighlightExtra,
              } as TanStackTableHighlightSourceProps<TData>;

              return (
                <TableRow
                  key={row.id}
                  row={row}
                  table={table}
                  contextMenu={contextMenu}
                  onContextMenuSelect={onContextMenuSelect}
                  onClick={
                    !activeRow && enableDefaultActiveRow
                      ? clickHandler
                      : onClick
                  }
                  isRowActive={
                    !activeRow
                      ? enableDefaultActiveRow
                        ? rowIndex === index
                        : false
                      : activeRow(row)
                  }
                  rowStyle={
                    typeof rowStyle === 'function' ? rowStyle(row) : rowStyle
                  }
                  disableDefaultRowStyle={disableDefaultRowStyle}
                  {...highlightSourceProps}
                />
              );
            })}
          </tbody>
        </BaseReactTable>
      </div>
      {(enableVirtualScroll || enableColumnsVirtualScroll) && (
        <p
          style={{
            ...counterStyle,
            ...(enableColumnsVirtualScroll && { bottom: '15px' }),
            opacity: !isCounterVisible ? '0' : '1',
            transition: 'all 0.5s',
            visibility: !isCounterVisible ? 'hidden' : 'visible',
          }}
        >
          {enableColumnsVirtualScroll && typeof startColumn === 'string' && (
            <span style={{ left: 0 }}>{`Column ${startColumn}`} </span>
          )}
          {typeof index === 'number' ? index + 1 : total} / {total}
        </p>
      )}
    </>
  );
}

function TanStackTable<TData extends TanStackRowData>(
  props: ReactTableOuterProps<TData>,
) {
  const {
    data,
    approxItemHeight = 40,
    approxColumnWidth = 40,
    groupKey,
    onSortEnd,
    columns,
    style = {},
  } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const visibleRowsCountRef = useRef<number>(0);
  const visibleColumnsCountRef = useRef<number>(0);
  const [mRef, { width, height } = { width: 0, height: 0 }] =
    useResizeObserver();

  const [tableVirtualBoundary, setTableVirtualBoundary] =
    useState<TanStackTableVirtualBoundary>({
      rows: {
        start: 1,
        end: 0,
      },
      columns: {
        start: 1,
        end: 0,
      },
    });

  useLayoutEffect(() => {
    if (containerRef.current && height && width) {
      const header = containerRef.current.querySelectorAll('thead');
      const rowsCount = Math.ceil(
        (Math.ceil(height) - Math.ceil(header[0].clientHeight)) /
          approxItemHeight,
      );
      const columnsCount = Math.ceil(Math.ceil(width) / approxColumnWidth);

      if (
        (rowsCount > 0 && rowsCount !== visibleRowsCountRef.current) ||
        (columnsCount > 0 && columnsCount !== visibleColumnsCountRef.current)
      ) {
        visibleRowsCountRef.current = rowsCount;
        visibleColumnsCountRef.current = columnsCount;
        setTableVirtualBoundary({
          rows: { start: 0, end: rowsCount },
          columns: { start: 0, end: columnsCount },
        });
      }
    }
  }, [approxColumnWidth, approxItemHeight, height, width]);

  function lookForGroupIndex(currentIndex: number, side: 1 | -1) {
    const currentItem = data[currentIndex];
    if ((currentItem as { index: number })?.index && groupKey) {
      switch (side) {
        case -1: {
          let index = currentIndex - 1;
          while (index > 0) {
            if (data[index][groupKey] !== currentItem[groupKey]) {
              return index + 1;
            }
            index--;
          }
          return currentIndex;
        }
        case 1: {
          let index = currentIndex + 1;
          while (index < data.length) {
            if (data[index][groupKey] !== currentItem[groupKey]) {
              return index - 1;
            }
            index++;
          }
          return currentIndex;
        }
        default:
          return currentIndex;
      }
    }

    return currentIndex;
  }

  function findColumnStartIndex(index: number, numberOfVisibleColumns: number) {
    const newIndex = index - numberOfVisibleColumns;
    return newIndex >= columns.length ? newIndex : index;
  }

  function findColumnEndIndex(index: number, numberOfVisibleColumns: number) {
    const newIndex = index + numberOfVisibleColumns;
    return newIndex >= columns.length ? columns.length - 1 : newIndex;
  }
  function findStartIndex(index: number, numberOfVisibleRows: number) {
    const newIndex = index - numberOfVisibleRows;
    const currentIndx = newIndex >= data.length ? newIndex : index;
    // return currentIndx;
    // Look for the first index of the group
    return lookForGroupIndex(currentIndx, -1);
  }

  function findEndIndex(index: number, numberOfVisibleRows: number) {
    const newIndex = index + numberOfVisibleRows;
    const currentIndx = newIndex >= data.length ? data.length - 1 : newIndex;
    // Look for the last index of the group
    return lookForGroupIndex(currentIndx, 1);
  }

  function scrollHandler() {
    if (containerRef.current) {
      const { scrollTop, scrollLeft } = containerRef.current;
      const rowCurrentIndx = Math.ceil(scrollTop / approxItemHeight);
      const rowStart = findStartIndex(
        rowCurrentIndx,
        visibleRowsCountRef.current,
      );
      const rowEnd = findEndIndex(rowCurrentIndx, visibleRowsCountRef.current);

      const columnCurrentIndx = Math.ceil(scrollLeft / approxColumnWidth);
      const columnStart = findColumnStartIndex(
        columnCurrentIndx,
        visibleColumnsCountRef.current,
      );
      const columnEnd = findColumnEndIndex(
        columnCurrentIndx,
        visibleColumnsCountRef.current,
      );
      setTableVirtualBoundary({
        rows: { start: rowStart, end: rowEnd },
        columns: { start: columnStart, end: columnEnd },
      });
    }
  }

  return (
    <TanStackTableProvider value={tableVirtualBoundary}>
      <div
        ref={mRef}
        css={css(
          {
            position: 'relative',
            height: '100%',
          },
          style,
        )}
      >
        <TanStackTableInner<TData>
          onScroll={scrollHandler}
          onSortEnd={onSortEnd}
          containerRef={containerRef}
          {...props}
        />
      </div>
    </TanStackTableProvider>
  );
}

export default memo(TanStackTable) as <TData extends TanStackRowData>(
  props: ReactTableOuterProps<TData>,
) => ReactElement;
