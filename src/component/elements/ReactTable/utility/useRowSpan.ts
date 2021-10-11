export default function useRowSpan(hooks) {
  hooks.useInstance.push(reducer);
}

function reducer(instance) {
  const { allColumns } = instance;

  let rowSpanHeaders: any[] = [];

  allColumns.forEach((column) => {
    const { id, enableRowSpan } = column;

    if (enableRowSpan !== undefined && enableRowSpan !== false) {
      rowSpanHeaders.push({ id, cellValue: null, cellIndex: 0 });
    }
  });

  Object.assign(instance, {
    rowSpanHeaders,
  });
}

export function prepareRowSpan(rows, index, rowSpanHeaders) {
  const row = rows[index];
  for (let j = 0; j < row.allCells.length; j++) {
    const cell = row.allCells[j];
    const rowSpanHeader = rowSpanHeaders.find((x) => x.id === cell.column.id);
    if (rowSpanHeader !== undefined) {
      if (
        rowSpanHeader.cellValue === null ||
        rowSpanHeader.cellValue !== `${cell.value}-${row.original.index}`
      ) {
        cell.isRowSpanned = false;
        rowSpanHeader.cellValue = `${cell.value}-${row.original.index}`;
        rowSpanHeader.cellIndex = index;
        cell.rowSpan = 1;
      } else {
        rows[rowSpanHeader.cellIndex].allCells[j].rowSpan++;
        cell.isRowSpanned = true;
      }
    }
  }
}
