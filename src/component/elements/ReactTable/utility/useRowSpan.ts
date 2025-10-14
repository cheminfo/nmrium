import type { Row } from 'react-table';

export type RowSpanHeaders = Array<{
  cellIndex: number;
  cellValue: string;
  id: string;
}>;

export default function useRowSpan(hooks: any) {
  hooks.useInstance.push(reducer);
}

function reducer(instance: any) {
  const { allColumns } = instance;

  const rowSpanHeaders = allColumns
    .filter(
      ({ enableRowSpan }: any) =>
        enableRowSpan !== undefined && enableRowSpan !== false,
    )
    .map(({ id }: any) => ({ id, cellValue: null, cellIndex: 0 }));

  Object.assign(instance, {
    rowSpanHeaders,
  });
}

export function prepareRowSpan<T extends object>(
  rows: Array<Row<T>>,
  index: number,
  rowSpanHeaders: RowSpanHeaders,
  groupKey?: keyof T,
) {
  const row = rows[index];
  for (let j = 0; j < row.allCells.length; j++) {
    const cell = row.allCells[j];
    const rowSpanHeader = rowSpanHeaders.find((x) => x.id === cell.column.id);
    if (rowSpanHeader !== undefined) {
      const cellValue = groupKey
        ? `${cell.value}-${String(row.original[groupKey])}`
        : cell.value;

      if (
        rowSpanHeader.cellValue === null ||
        rowSpanHeader.cellValue !== cellValue
      ) {
        // @ts-expect-error Modifying a property that doesn't exist on the type
        cell.isRowSpanned = false;
        rowSpanHeader.cellValue = cellValue;
        rowSpanHeader.cellIndex = index;
        // @ts-expect-error Modifying a property that doesn't exist on the type
        cell.rowSpan = 1;
      } else {
        // @ts-expect-error Modifying a property that doesn't exist on the type
        rows[rowSpanHeader.cellIndex].allCells[j].rowSpan++;
        // @ts-expect-error Modifying a property that doesn't exist on the type
        cell.isRowSpanned = true;
      }
    }
  }
}
