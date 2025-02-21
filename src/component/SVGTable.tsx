import { createContext, useContext, useMemo } from 'react';

type CellTextProps = Omit<
  React.SVGAttributes<SVGTextElement>,
  'x' | 'y' | 'width' | 'height'
>;
type CellBoxProps = Omit<
  React.SVGAttributes<SVGRectElement>,
  'x' | 'y' | 'width' | 'height' | 'dx' | 'dy'
>;

interface StyleCell {
  cellTextProps?: CellTextProps;
  cellBoxProps?: CellBoxProps;
}
interface BaseSVGTableColumn<T> extends StyleCell {
  header: string;
  width: number;
  minWidth?: number;
  rowSpanGroupKey?: keyof T;
  headerTextProps?: CellTextProps;
  headerBoxProps?: CellBoxProps;
}
interface AccessorKeyColumn<T> extends BaseSVGTableColumn<T> {
  accessorKey: string;
}

interface AccessorFuncColumn<T> extends BaseSVGTableColumn<T> {
  accessorFun: (row: T) => number | string;
}

export type SVGTableColumn<T> = AccessorKeyColumn<T> | AccessorFuncColumn<T>;

function isAccessorKeyColumn<T>(
  column: SVGTableColumn<T>,
): column is AccessorKeyColumn<T> {
  return 'accessorKey' in column;
}

interface ColumnOptions {
  key: string;
  x: number;
  width: number;
}

type InternalColumns<T> = SVGTableColumn<T> & { _columnOptions: ColumnOptions };

interface SVGTableContextProps {
  rowHeight: number;
}

const SVGTableContext = createContext<SVGTableContextProps | null>(null);

function useSVGTable() {
  return useContext(SVGTableContext);
}

function mapColumns<T>(columns: Array<SVGTableColumn<T>>) {
  let x = 0;
  const output: Array<InternalColumns<T>> = [];
  for (const column of columns) {
    const width = Math.max(column.width, column.minWidth || 0);
    const options: ColumnOptions = { width, x, key: crypto.randomUUID() };
    output.push({ ...column, _columnOptions: options });
    x += Math.max(column.width, column.minWidth || 0);
  }
  return { width: x, columns: output };
}

interface FormatKeyOptions {
  rowIndex: number;
  columnKey: string;
  groupKey: string;
}

function formatKey(options: FormatKeyOptions) {
  const { rowIndex, columnKey, groupKey } = options;
  return `GroupKey[${groupKey || null}]-ColumnKey[${columnKey}]-RowIndex[${rowIndex}]`;
}

function mapRowsSpan<T>(data: T[], columns: Array<InternalColumns<T>>) {
  const rowSpanMap = new Map<string, number>();
  const skipColumns = new Set<string>(); // columns that should be skipped

  for (const col of columns) {
    if (!col.rowSpanGroupKey) continue; // Skip columns without row spanning

    let lastValue: string | null = null;
    let lastRowIndex = 0;
    let lastGroupKey: string | null = null;

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      const groupKey = String(row?.[col.rowSpanGroupKey] || '');
      const key = col._columnOptions.key;
      const value = isAccessorKeyColumn(col)
        ? row[col.accessorKey]
        : col.accessorFun(row);

      if (
        value === lastValue &&
        lastRowIndex !== null &&
        groupKey === lastGroupKey
      ) {
        //skipped row columns
        const prevKey = formatKey({
          groupKey,
          columnKey: key,
          rowIndex: lastRowIndex,
        });
        rowSpanMap.set(prevKey, (rowSpanMap.get(prevKey) || 1) + 1);
        skipColumns.add(formatKey({ groupKey, columnKey: key, rowIndex }));
      } else {
        // Start a new rowspan
        lastValue = value;
        lastRowIndex = rowIndex;
        lastGroupKey = groupKey;
        rowSpanMap.set(formatKey({ groupKey, columnKey: key, rowIndex }), 1);
      }
    }
  }

  return { rowSpanMap, skipColumns };
}

interface SVGTableProps<T> {
  columns: Array<SVGTableColumn<T>>;
  rowHeight?: number;
  data: T[];
}

export function SVGTable<T>(props: SVGTableProps<T>) {
  const { columns: externalColumns, data, rowHeight = 25 } = props;

  const { width, columns } = mapColumns(externalColumns);

  let yOffset = rowHeight;

  const tableOptions = useMemo(() => {
    return { rowHeight };
  }, [rowHeight]);

  const { rowSpanMap, skipColumns } = useMemo(() => {
    return mapRowsSpan(data, columns);
  }, [columns, data]);

  return (
    <SVGTableContext.Provider value={tableOptions}>
      <svg
        width={width}
        height={rowHeight * (data.length + 1)}
        viewBox={`0 0 ${width} ${rowHeight * (data.length + 1)}`}
        textAnchor="middle"
      >
        {columns.map((col) => {
          const {
            header,
            headerBoxProps,
            headerTextProps,
            _columnOptions: { key },
          } = col;
          return (
            <Column
              key={key}
              value={header}
              cellTextProps={headerTextProps}
              column={col}
              rowSpan={1}
              cellBoxProps={headerBoxProps}
            />
          );
        })}

        {data.map((row, rowIndex) => {
          const currentY = yOffset;
          yOffset += rowHeight;

          return (
            <g key={rowIndex} transform={`translate(0, ${currentY})`}>
              {columns.map((col) => {
                const {
                  cellBoxProps,
                  cellTextProps,
                  _columnOptions: { key: columnKey },
                } = col;
                const groupKey = col.rowSpanGroupKey
                  ? row?.[col.rowSpanGroupKey]
                  : '';
                const cellKey = formatKey({
                  groupKey: String(groupKey),
                  columnKey,
                  rowIndex,
                });
                if (skipColumns.has(cellKey)) {
                  return null; // Skip merged row
                }

                const rowSpan = rowSpanMap.get(cellKey) || 1;

                return (
                  <ValueColumn
                    key={columnKey}
                    column={col}
                    row={row}
                    rowSpan={rowSpan}
                    cellBoxProps={cellBoxProps}
                    cellTextProps={cellTextProps}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    </SVGTableContext.Provider>
  );
}

interface BaseColumnProps<T> extends StyleCell {
  column: InternalColumns<T>;
  rowSpan: number;
}

interface ColumnProps<T> extends BaseColumnProps<T> {
  value: string | number;
}

interface ValueColumnProps<T> extends BaseColumnProps<T> {
  row: T;
}

function ValueColumn<T>(props: ValueColumnProps<T>) {
  const { row, ...otherProps } = props;
  const column = otherProps.column;
  let value: number | string = '';
  if (isAccessorKeyColumn(column)) {
    value = row[column.accessorKey];
  } else {
    value = column.accessorFun(row);
  }
  return <Column {...otherProps} value={value} />;
}

function Column<T>(props: ColumnProps<T>) {
  const { value, column, cellTextProps, cellBoxProps, rowSpan } = props;
  const tableOptions = useSVGTable();
  if (!tableOptions) return null;

  const {
    _columnOptions: { x, width },
  } = column;
  const { rowHeight } = tableOptions;

  return (
    <g>
      <rect
        x={x}
        y="0"
        width={width}
        height={rowHeight * rowSpan}
        fill="white"
        stroke="black"
        strokeWidth="1"
        {...cellBoxProps}
      />
      <text
        x={x + width / 2}
        y={(rowHeight * rowSpan) / 2}
        fontSize="11"
        dominantBaseline="middle"
        {...cellTextProps}
      >
        {value}
      </text>
    </g>
  );
}
