export default function useRowSpan(hooks) {
  hooks.useInstance.push(reducer);
}

function reducer(instance) {
  const { allColumns } = instance;

  const rowSpanHeaders = allColumns
    .filter(
      ({ enableRowSpan }) =>
        enableRowSpan !== undefined && enableRowSpan !== false,
    )
    .map(({ id }) => ({ id, cellValue: null, cellIndex: 0 }));

  Object.assign(instance, {
    rowSpanHeaders,
  });
}

export function prepareRowSpan(rows, index, rowSpanHeaders, groupKey?: string) {
  const row = rows[index];
  for (let j = 0; j < row.allCells.length; j++) {
    const cell = row.allCells[j];
    const rowSpanHeader = rowSpanHeaders.find((x) => x.id === cell.column.id);
    if (rowSpanHeader !== undefined) {
      const cellValue = groupKey
        ? `${cell.value}-${row.original[groupKey]}`
        : cell.value;

      if (
        rowSpanHeader.cellValue === null ||
        rowSpanHeader.cellValue !== cellValue
      ) {
        cell.isRowSpanned = false;
        rowSpanHeader.cellValue = cellValue;
        rowSpanHeader.cellIndex = index;
        cell.rowSpan = 1;
      } else {
        rows[rowSpanHeader.cellIndex].allCells[j].rowSpan++;
        cell.isRowSpanned = true;
      }
    }
  }
}
