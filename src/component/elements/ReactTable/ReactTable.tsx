/* eslint-disable unicorn/prefer-logical-operator-over-ternary */
/** @jsxImportSource @emotion/react */
import {
  useRef,
  useCallback,
  memo,
  forwardRef,
  useState,
  Ref,
  useEffect,
  UIEvent,
  CSSProperties,
} from 'react';
import {
  useTable,
  useSortBy,
  TableInstance,
  CellProps,
  Column as ReactColumn,
  UseSortByColumnOptions,
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
};

interface ReactTableProps extends ClickEvent {
  data: any;
  columns: any;
  highlightedSource?: HighlightEventSource;
  context?: Array<{ label: string; onClick: () => void }> | null;
  approxItemHeight?: number;
  groupKey?: string;
  indexKey?: string;
  enableVirtualScroll?: boolean;
  highlightActiveRow?: boolean;
  totalCount?: number;
}

interface ReactTableInnerProps extends ReactTableProps {
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
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
    highlightActiveRow = false,
    totalCount,
    indexKey = 'index',
  } = props;

  const contextRef = useRef<any>(null);
  const { index: indexBoundary } = useReactTableContext();
  const [rowIndex, setRowIndex] = useState<number>();
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
  const contextMenuHandler = useCallback(
    (e, row) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
        contextRef.current.handleContextMenu(e, row.original);
      }
    },
    [contextRef],
  );

  const rowsData = enableVirtualScroll
    ? rows.slice(indexBoundary.start, indexBoundary.end)
    : rows;

  const clickHandler = useCallback(
    (event, row) => {
      setRowIndex(row.index);
      onClick?.(event, row);
    },
    [onClick],
  );

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
              height: approxItemHeight * data.length,
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
          <ReactTableHeader headerGroups={headerGroups} />
          <tbody {...getTableBodyProps()}>
            {rowsData.map((row, index) => {
              prepareRow(row);

              prepareRowSpan(
                rows,
                enableVirtualScroll ? index + indexBoundary.start : index,
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
                  onClick={highlightActiveRow ? clickHandler : onClick}
                  highlightedSource={highlightedSource}
                  isRowActive={rowIndex === index}
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

export interface TableVirtualConfig {
  scrollHeight: number;
  numberOfVisibleRows: number;
  index: { start: number; end: number };
}

function ReactTable(props: ReactTableProps) {
  const { data, approxItemHeight = 40, groupKey } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mRef, { height }] = useMeasure<HTMLDivElement>();

  const [tableVirtualConfig, setTableVirtualConfig] =
    useState<TableVirtualConfig>({
      scrollHeight: 0,
      numberOfVisibleRows: 0,
      index: { start: 0, end: 0 },
    });

  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight } = containerRef.current;
      const header = containerRef.current.querySelectorAll('thead');
      const numberOfVisibleRows = Math.ceil(
        (height - header[0].clientHeight) / approxItemHeight,
      );
      setTableVirtualConfig((prev) => ({
        ...prev,
        scrollHeight,
        numberOfVisibleRows: numberOfVisibleRows - 1,
        index: { start: 0, end: numberOfVisibleRows },
      }));
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
    if (containerRef.current && tableVirtualConfig) {
      const { scrollTop } = containerRef.current;
      const { numberOfVisibleRows, index } = tableVirtualConfig;
      const currentIndx = Math.ceil(scrollTop / approxItemHeight);
      const start = findStartIndex(currentIndx, numberOfVisibleRows);
      if (currentIndx !== index.start) {
        const end = findEndIndex(currentIndx, numberOfVisibleRows);
        setTableVirtualConfig({
          ...tableVirtualConfig,
          index: { start, end: end + 1 },
        });
      }
    }
  }

  return (
    <ReactTableProvider value={tableVirtualConfig}>
      <div
        ref={mRef}
        style={{
          position: 'relative',
          height: '100%',
        }}
      >
        <ReactTableInner
          onScroll={scrollHandler}
          ref={containerRef}
          {...{ ...props }}
        />
      </div>
    </ReactTableProvider>
  );
}

export default memo(ReactTable);
