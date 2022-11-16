/* eslint-disable unicorn/prefer-logical-operator-over-ternary */
/** @jsxImportSource @emotion/react */
import {
  useRef,
  memo,
  forwardRef,
  useState,
  Ref,
  CSSProperties,
  WheelEvent,
  useLayoutEffect,
  useEffect,
} from 'react';
import {
  useTable,
  useSortBy,
  TableInstance,
  CellProps,
  Column as ReactColumn,
  UseSortByColumnOptions,
  UseSortByInstanceProps,
} from 'react-table';
import { useMeasure } from 'react-use';

import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import { HighlightEventSource } from '../../highlight';
import ContextMenu from '../ContextMenu';

import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow, { ClickEvent } from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';
import {
  ReactTableProvider,
  useReactTableContext,
} from './utility/ReactTableContext';
import useRowSpan, {
  prepareRowSpan,
  RowSpanHeaders,
} from './utility/useRowSpan';

interface ExtraColumn<T extends object> {
  enableRowSpan?: boolean;
  style?: CSSProperties;
  Cell?: (cell: CellProps<T, any>) => JSX.Element | string;
}

export type Column<T extends object> = ReactColumn<T> &
  ExtraColumn<T> &
  UseSortByColumnOptions<T>;

type TableInstanceWithHooks = TableInstance & {
  rowSpanHeaders: RowSpanHeaders;
} & UseSortByInstanceProps<any>;

interface SortEvent {
  onSortEnd?: (data: any) => void;
}

export interface RowStyle {
  rowStyle?: {
    active?: CSSProperties;
    activated?: CSSProperties;
    hover?: CSSProperties;
    base?: CSSProperties;
  };
  disableDefaultRowStyle?: boolean;
}
interface ReactTableProps extends ClickEvent, SortEvent, RowStyle {
  data: any;
  columns: any;
  highlightedSource?: HighlightEventSource;
  context?: Array<{ label: string; onClick: (data: any) => void }> | null;
  approxItemHeight?: number;
  groupKey?: string;
  indexKey?: string;
  enableVirtualScroll?: boolean;
  activeRow?: (data: any) => boolean;
  totalCount?: number;
}

interface ReactTableInnerProps extends ReactTableProps {
  onScroll: (event: WheelEvent<HTMLDivElement>) => void;
}

const styles = {
  table: (enableVirtualScroll: boolean): CSSProperties => {
    if (enableVirtualScroll) {
      return { position: 'sticky', top: 0 };
    }
    return {};
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

const ReactTableInner = forwardRef(function ReactTableInner(
  props: ReactTableInnerProps,
  ref: Ref<HTMLDivElement>,
) {
  const {
    data,
    columns,
    highlightedSource,
    context = null,
    onScroll,
    approxItemHeight = 40,
    enableVirtualScroll = false,
    groupKey,
    onClick,
    activeRow,
    totalCount,
    indexKey = 'index',
    onSortEnd,
    rowStyle,
    disableDefaultRowStyle = false,
  } = props;

  const contextRef = useRef<any>(null);
  const isSortedEventTriggered = useRef<boolean>(false);
  const virtualBoundary = useReactTableContext();
  const [activeRowData, setActiveRowData] = useState<any>();
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const [isCounterVisible, setCounterVisibility] = useState(false);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    rowSpanHeaders,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useRowSpan,
  ) as TableInstanceWithHooks;
  function contextMenuHandler(e, row) {
    if (!checkModifierKeyActivated(e)) {
      e.preventDefault();
      contextRef.current.handleContextMenu(e, row.original);
    }
  }

  function clickHandler(event, row) {
    setActiveRowData(row);
    onClick?.(event, row);
  }

  function scrollHandler(e) {
    if (enableVirtualScroll) {
      onScroll(e);
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
      const data = rows.map((row) => row.original);
      onSortEnd?.(data);
      isSortedEventTriggered.current = false;
    }
  }, [onSortEnd, rows]);

  function headerClickHandler() {
    isSortedEventTriggered.current = true;
  }

  const end =
    virtualBoundary.end === rows.length - 1
      ? virtualBoundary.end + 1
      : virtualBoundary.end;
  const rowsData = enableVirtualScroll
    ? rows.slice(virtualBoundary.start, end)
    : rows;

  const index =
    rowsData[rowsData.length - 1]?.original[indexKey] ||
    rowsData[rowsData.length - 1]?.index;
  const total = totalCount ? totalCount : data.length;

  return (
    <>
      <div
        ref={ref}
        className="table-container"
        style={{
          overflowY: 'auto',
          position: 'relative',
          height: '100%',
        }}
        onScroll={scrollHandler}
      >
        {enableVirtualScroll && (
          <div
            style={{
              height: approxItemHeight * (data.length + 1),
              position: 'absolute',
              width: '100%',
              pointerEvents: 'none',
            }}
          />
        )}
        <table
          {...getTableProps()}
          css={ReactTableStyle}
          style={styles.table(enableVirtualScroll)}
        >
          <ReactTableHeader
            headerGroups={headerGroups}
            onClick={headerClickHandler}
          />
          <tbody {...getTableBodyProps()}>
            {rowsData.map((row, index) => {
              prepareRow(row);

              prepareRowSpan(
                rows,
                enableVirtualScroll ? index + virtualBoundary.start : index,
                rowSpanHeaders,
                groupKey,
              );
              const { key, ...restRowProps } = row.getRowProps();
              return (
                <ReactTableRow
                  key={key}
                  {...restRowProps}
                  row={row}
                  onContextMenu={(e) => contextMenuHandler(e, row)}
                  onClick={activeRow ? clickHandler : onClick}
                  highlightedSource={highlightedSource}
                  isRowActive={
                    !activeRow ? activeRowData?.index === index : activeRow(row)
                  }
                  rowStyle={rowStyle}
                  disableDefaultRowStyle={disableDefaultRowStyle}
                />
              );
            })}
          </tbody>
        </table>
        <ContextMenu ref={contextRef} context={context} />
      </div>
      {enableVirtualScroll && (
        <p
          style={{
            ...counterStyle,
            opacity: !isCounterVisible ? '0' : '1',
            transition: 'all 0.5s',
            visibility: !isCounterVisible ? 'hidden' : 'visible',
          }}
        >
          {index + 1} / {total}
        </p>
      )}
    </>
  );
});

export interface TableVirtualBoundary {
  start: number;
  end: number;
}

function ReactTable(props: ReactTableProps) {
  const { data, approxItemHeight = 40, groupKey, onSortEnd } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const visibleRowsCountRef = useRef<number>(0);
  const [mRef, { height }] = useMeasure<HTMLDivElement>();

  const [tableVirtualBoundary, setTableVirtualBoundary] =
    useState<TableVirtualBoundary>({
      start: 1,
      end: 0,
    });

  useLayoutEffect(() => {
    if (containerRef.current) {
      const header = containerRef.current.querySelectorAll('thead');
      visibleRowsCountRef.current = Math.ceil(
        (height - header[0].clientHeight) / approxItemHeight,
      );
      setTableVirtualBoundary({ start: 0, end: visibleRowsCountRef.current });
    }
  }, [approxItemHeight, height]);

  function lookForGroupIndex(currentIndex: number, side: 1 | -1) {
    const currentItem = data[currentIndex];
    if (currentItem.index && groupKey) {
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
      const { scrollTop } = containerRef.current;
      const currentIndx = Math.ceil(scrollTop / approxItemHeight);
      const start = findStartIndex(currentIndx, visibleRowsCountRef.current);
      const end = findEndIndex(currentIndx, visibleRowsCountRef.current);
      setTableVirtualBoundary({ start, end });
    }
  }

  return (
    <ReactTableProvider value={tableVirtualBoundary}>
      <div
        ref={mRef}
        style={{
          position: 'relative',
          height: '100%',
        }}
      >
        <ReactTableInner
          onScroll={scrollHandler}
          onSortEnd={onSortEnd}
          ref={containerRef}
          {...{ ...props }}
        />
      </div>
    </ReactTableProvider>
  );
}

export default memo(ReactTable);
