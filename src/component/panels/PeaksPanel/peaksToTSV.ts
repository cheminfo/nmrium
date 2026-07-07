import dlv from 'dlv';

import type { TanStackTableColumn } from '../../elements/TanStackTable/TanStackTable.js';

import type { PeakRecord } from './PeaksPanel.tsx';

type ExportCellValue = boolean | null | number | string | undefined;

type ExportablePeakColumn = TanStackTableColumn<PeakRecord> & {
  accessorFn?: (row: PeakRecord, index: number) => ExportCellValue;
  accessorKey?: string | number;
};

function formatCellValue(value: ExportCellValue) {
  return value === null || value === undefined ? '' : String(value);
}

export function exportPeaksToTSV(
  data: PeakRecord[],
  tableColumns: Array<TanStackTableColumn<PeakRecord>>,
) {
  const exportColumns = tableColumns.filter(
    (col) => col.header && typeof col.header === 'string',
  );

  const headers: string[] = [];
  for (const col of exportColumns) {
    headers.push(col.header as string);
  }

  const rows: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    const cells: string[] = [];
    for (const col of exportColumns) {
      const { accessorFn, accessorKey } = col as ExportablePeakColumn;
      if (accessorKey) {
        const accessor = String(accessorKey);
        cells.push(formatCellValue(dlv(record, accessor) as ExportCellValue));
      } else if (typeof accessorFn === 'function') {
        cells.push(formatCellValue(accessorFn(record, i) as ExportCellValue));
      } else {
        cells.push('');
      }
    }
    rows.push(cells.join('\t'));
  }
  return `${headers.join('\t')}\n${rows.join('\n')}`;
}
