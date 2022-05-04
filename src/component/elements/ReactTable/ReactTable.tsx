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
} from 'react';
import { useTable, useSortBy } from 'react-table';
import { useMeasure } from 'react-use';

import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import { HighlightedSource } from '../../highlight';
import useCombinedRefs from '../../hooks/useCombinedRefs';
import ContextMenu from '../ContextMenu';

import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow, { ClickEvent } from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';
import {
  ReactTableProvider,
  useReactTableContext,
} from './utility/ReactTableContext';
import useRowSpan, { prepareRowSpan } from './utility/useRowSpan';

interface ReactTableProps extends ClickEvent {
  data: any;
  columns: any;
  highlightedSource?: HighlightedSource;
  context?: Array<{ label: string; onClick: () => void }> | null;
  approxItemHeight?: number;
  groupKey?: string;
  enableVirtualScroll?: boolean;
  highlightActiveRow?: boolean;
}

interface ReactTableInnerProps extends ReactTableProps {
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
}

const styles = {
  table: (enableVirtualScroll: boolean) => {
    if (enableVirtualScroll) {
      return { position: 'sticky', top: 0 };
    }
  },
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
  } = props;

  const contextRef = useRef<any>(null);
  const { index: indexBoundary } = useReactTableContext();
  const [rowIndex, setRowIndex] = useState<number>();

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
  );
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

  return (
    <div
      ref={ref}
      className="table-container"
      style={{
        overflowY: 'auto',
        position: 'relative',
        height: '100%',
      }}
      {...(enableVirtualScroll && { onScroll })}
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

            return (
              <ReactTableRow
                key={row.key}
                row={row}
                {...row.getRowProps()}
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
  );
});

export interface TableVirtualConfig {
  offsetHeight: number;
  scrollHeight: number;
  numberOfVisibleRows: number;
  index: { start: number; end: number };
}

function ReactTable(props: ReactTableProps) {
  const { data, approxItemHeight = 40, groupKey } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const [mRef, { height }] = useMeasure();
  const combineRef = useCombinedRefs([mRef, ref]);

  const [tableVirtualConfig, setTableVirtualConfig] =
    useState<TableVirtualConfig>({
      offsetHeight: 0,
      scrollHeight: 0,
      numberOfVisibleRows: 0,
      index: { start: 0, end: 0 },
    });

  useEffect(() => {
    if (combineRef.current) {
      const { scrollHeight } = combineRef.current;
      const numberOfVisibleRows = Math.ceil(height / approxItemHeight);
      setTableVirtualConfig((prev) => ({
        ...prev,
        offsetHeight: height,
        scrollHeight,
        numberOfVisibleRows,
        index: { start: 0, end: numberOfVisibleRows + 1 },
      }));
    }
  }, [approxItemHeight, combineRef, height]);

  const lookForGroupIndex = useCallback(
    (currentIndex: number, side: 1 | -1) => {
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
    },
    [data, groupKey],
  );

  const findStartIndex = useCallback(
    (index: number, numberOfVisibleRows: number) => {
      const newIndex = index - numberOfVisibleRows;
      const currentIndx = newIndex >= data.length ? newIndex : index;
      // return currentIndx;
      // Look for the first index of the group
      return lookForGroupIndex(currentIndx, -1);
    },
    [data.length, lookForGroupIndex],
  );
  const findEndIndex = useCallback(
    (index: number, numberOfVisibleRows: number) => {
      const newIndex = index + numberOfVisibleRows;
      const currentIndx = newIndex >= data.length ? data.length - 1 : newIndex;
      // return currentIndx;
      // Look for the last index of the group
      return lookForGroupIndex(currentIndx, 1);
    },
    [data.length, lookForGroupIndex],
  );

  const scrollHandler = useCallback(() => {
    if (ref.current && tableVirtualConfig) {
      const { scrollTop } = ref.current;
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
  }, [approxItemHeight, findEndIndex, findStartIndex, tableVirtualConfig]);

  return (
    <ReactTableProvider value={tableVirtualConfig}>
      <ReactTableInner
        onScroll={scrollHandler}
        ref={combineRef}
        {...{ ...props }}
      />
    </ReactTableProvider>
  );
}

export default memo(ReactTable);
