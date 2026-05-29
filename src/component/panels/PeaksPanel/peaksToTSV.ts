import dlv from 'dlv';

import type { ControlCustomColumn } from '../../elements/ReactTable/utility/addCustomColumn.tsx';

import type { PeakRecord } from './PeaksPanel.tsx';

export function exportPeaksToTSV(
  data: PeakRecord[],
  tableColumns: Array<ControlCustomColumn<PeakRecord>>,
) {
  const exportColumns = tableColumns.filter(
    (col) => col.Header && typeof col.Header === 'string',
  );

  const headers: string[] = [];
  for (const col of exportColumns) {
    headers.push(col.Header as string);
  }

  const rows: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    const cells: string[] = [];
    for (const col of exportColumns) {
      const accessor = col.accessor;
      if (typeof accessor === 'string') {
        cells.push(String(dlv(record, accessor) ?? ''));
      } else if (typeof accessor === 'function') {
        cells.push(
          String(
            accessor(record, i, {
              subRows: [],
              depth: 0,
              data: [],
            }) ?? '',
          ),
        );
      } else {
        cells.push('');
      }
    }
    rows.push(cells.join('\t'));
  }
  return `${headers.join('\t')}\n${rows.join('\n')}`;
}
