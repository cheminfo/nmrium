import type { CellData, RowData } from '@tanstack/react-table';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

import type { TanStackTableColumn } from '../TanStackTable.js';

export type CustomColumn<
  TData extends RowData,
  TValue extends CellData = CellData,
> = TanStackTableColumn<TData, TValue> & { index: number };

export type ControlCustomColumn<
  TData extends RowData,
  TValue extends CellData = CellData,
> = CustomColumn<TData, TValue> & { showWhen: string };

interface CreateActionColumnOptions<TData extends RowData> {
  onClick: (row: TData, event?: MouseEvent<HTMLButtonElement>) => void;
  icon: ReactNode;
  style?: CSSProperties;
  index: number;
  id?: string;
}

export function createActionColumn<TData extends RowData>(
  options: CreateActionColumnOptions<TData>,
): CustomColumn<TData> {
  const { onClick, icon, index, style = {}, id = `action-${index}` } = options;

  return {
    index,
    header: '',
    id,
    meta: {
      style: {
        width: '1%',
        maxWidth: '20px',
        minWidth: '20px',
        padding: '0px',
        textAlign: 'center',
        ...style,
      },
    },
    cell: ({ row }) => (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick(row.original, event);
        }}
      >
        {icon}
      </button>
    ),
  };
}

export function getTableColumns<TData extends RowData>(
  columns: Array<ControlCustomColumn<TData>>,
  isVisible: (showWhen: string) => boolean,
): Array<TanStackTableColumn<TData, any>> {
  return columns
    .filter((column) => isVisible(column.showWhen))
    .toSorted((object1, object2) => object1.index - object2.index)
    .map((column) => {
      const { index, showWhen, ...tableColumn } = column;
      return tableColumn;
    });
}
