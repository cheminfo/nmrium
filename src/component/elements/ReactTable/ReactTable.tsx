/* eslint-disable unicorn/prefer-logical-operator-over-ternary */
/** @jsxImportSource @emotion/react */
import type { CSSObject, SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import type { CSSProperties, ReactElement, Ref, WheelEvent } from 'react';
import {
  forwardRef,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useResizeObserver } from 'react-d3-utils';
import type {
  CellProps,
  Column as ReactColumn,
  TableInstance,
  UseSortByColumnOptions,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseTableOptions,
} from 'react-table';
import { useSortBy, useTable } from 'react-table';

import type { HighlightEventSource } from '../../highlight/index.js';
import type { BaseContextMenuProps } from '../ContextMenuBluePrint.js';

import { BaseReactTable } from './BaseReactTable.js';
import { EmptyDataRow } from './Elements/EmptyDataRow.js';
import ReactTableHeader from './Elements/ReactTableHeader.js';
import type { ClickEvent } from './Elements/ReactTableRow.js';
import ReactTableRow from './Elements/ReactTableRow.js';
import {
  ReactTableProvider,
  useReactTableContext,
} from './utility/ReactTableContext.js';
import type { RowSpanHeaders } from './utility/useRowSpan.js';
import useRowSpan, { prepareRowSpan } from './utility/useRowSpan.js';

interface ExtraColumn<T extends object = any> {
  enableRowSpan?: boolean;
  style?: CSSProperties;
  Cell?: (cell: CellProps<T>) => ReactElement | string;
}

export type Column<T extends object = any> = ReactColumn<T> &
  ExtraColumn<T> &
  UseSortByColumnOptions<T>;

type TableInstanceWithHooks<T extends object = any> = TableInstance<T> & {
  rowSpanHeaders: RowSpanHeaders;
} & UseSortByInstanceProps<T>;

type TableOptions<T extends object = any> = UseTableOptions<T> &
  UseSortByOptions<T>;

interface SortEvent {
  onSortEnd?: (data: any, isTableSorted?: boolean) => void;
}

export interface BaseRowStyle {
  active?: CSSProperties;
  activated?: CSSProperties;
  hover?: CSSProperties;
  base?: CSSProperties;
}

export interface TableContextMenuProps {
  onContextMenuSelect?: (
    selected: Parameters<BaseContextMenuProps['onSelect']>[0],
    data: any,
  ) => void;
  contextMenu?: BaseContextMenuProps['options'];
}
interface ReactTableProps<T extends object = any>
  extends TableContextMenuProps,
    ClickEvent,
    SortEvent {
  data: T[];
  columns: Array<Column<T>>;
  highlightedSource?: HighlightEventSource;
  approxItemHeight?: number;
  approxColumnWidth?: number;
  groupKey?: string;
  indexKey?: string;
  enableVirtualScroll?: boolean;
  enableColumnsVirtualScroll?: boolean;
  activeRow?: (data: any) => boolean;
  enableDefaultActiveRow?: boolean;
  totalCount?: number;
  emptyDataRowText?: string;
  rowStyle?: BaseRowStyle | ((data: T) => BaseRowStyle | undefined);
  style?: CSSObject | SerializedStyles;
  disableDefaultRowStyle?: boolean;
}

interface ReactTableInnerProps<T extends object> extends ReactTableProps<T> {
  onScroll?: (event: WheelEvent<HTMLDivElement>) => void;
}

const styles = {
  table: (
    enableVirtualScroll: boolean,
    enableColumnsVirtualScroll,
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

const ReactTableInner = forwardRef(TableInner) as <T extends object = any>(
  props: ReactTableInnerProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

function TableInner<T extends object>(
  props: ReactTableInnerProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const {
    data,
    columns,
    highlightedSource,
    contextMenu = [],
    onContextMenuSelect,
    onScroll,
    approxItemHeight = 40,
    enableVirtualScroll = false,
    enableColumnsVirtualScroll = false,
    approxColumnWidth = 40,
    groupKey,
    onClick,
    activeRow,
    totalCount,
    indexKey = 'index',
    onSortEnd,
    rowStyle,
    disableDefaultRowStyle = false,
    enableDefaultActiveRow = false,
    emptyDataRowText = 'No Data',
  } = props;

  const isSortedEventTriggered = useRef<boolean>(false);
  const virtualBoundary = useReactTableContext();
  const [rowIndex, setRowIndex] = useState<number>();
  const timeoutIdRef = useRef<NodeJS.Timeout>();
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    rowSpanHeaders,
    state, // Access the sort state here
  } = useTable(
    {
      columns: memoColumns,
      data,
      autoResetSortBy: false,
    } as TableOptions<T>,
    useSortBy,
    useRowSpan,
  ) as TableInstanceWithHooks<T>;

  const { sortBy } = state as any;

  function clickHandler(event, row) {
    setRowIndex(row.index);
    onClick?.(event, row);
  }

  function scrollHandler(e) {
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

  const index = rowsData.at(-1)?.original[indexKey] || rowsData.at(-1)?.index;
  const total = totalCount ? totalCount : data.length;

  const startColumn = columns[virtualBoundary.columns.start]?.Header;

  return (
    <>
      <div
        ref={ref}
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
          {...getTableProps()}
          style={styles.table(enableVirtualScroll, enableColumnsVirtualScroll)}
        >
          <ReactTableHeader
            headerGroups={headerGroups}
            onClick={headerClickHandler}
          />
          <tbody {...getTableBodyProps()}>
            {!data ||
              (data?.length === 0 && (
                <EmptyDataRow columns={columns} text={emptyDataRowText} />
              ))}
            {rowsData.map((row, index) => {
              prepareRow(row);

              prepareRowSpan(
                rows,
                enableVirtualScroll
                  ? index + virtualBoundary.rows.start
                  : index,
                rowSpanHeaders,
                groupKey,
              );
              const { key, ...restRowProps } = row.getRowProps();

              return (
                <ReactTableRow
                  key={key}
                  {...restRowProps}
                  row={row}
                  contextMenu={contextMenu}
                  onContextMenuSelect={onContextMenuSelect}
                  onClick={
                    !activeRow && enableDefaultActiveRow
                      ? clickHandler
                      : onClick
                  }
                  highlightedSource={highlightedSource}
                  isRowActive={
                    !activeRow
                      ? enableDefaultActiveRow
                        ? rowIndex === index
                        : false
                      : activeRow(row)
                  }
                  rowStyle={
                    typeof rowStyle === 'function'
                      ? rowStyle(row as T)
                      : rowStyle
                  }
                  disableDefaultRowStyle={disableDefaultRowStyle}
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

interface VirtualBoundary {
  start: number;
  end: number;
}
export interface TableVirtualBoundary {
  rows: VirtualBoundary;
  columns: VirtualBoundary;
}

function ReactTable<T extends object>(props: ReactTableProps<T>) {
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
    useState<TableVirtualBoundary>({
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
    // return currentIndx;
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
    <ReactTableProvider value={tableVirtualBoundary}>
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
        <ReactTableInner<T>
          onScroll={scrollHandler}
          onSortEnd={onSortEnd}
          ref={containerRef}
          {...props}
        />
      </div>
    </ReactTableProvider>
  );
}

export default memo(ReactTable) as <T extends object = any>(
  props: ReactTableInnerProps<T>,
) => ReactElement;
