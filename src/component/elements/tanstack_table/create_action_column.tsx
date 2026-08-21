import type { CSSProperties, MouseEvent, ReactNode } from 'react';

import type { TanStackRowData, TanStackTableColumn } from './types.ts';

interface CreateActionColumnOptions<TData extends TanStackRowData> {
  onClick: (row: TData, event?: MouseEvent<HTMLButtonElement>) => void;
  icon: ReactNode;
  style?: CSSProperties;
  id?: string;
}

export function createActionColumn<TData extends TanStackRowData>(
  options: CreateActionColumnOptions<TData>,
): TanStackTableColumn<TData> {
  const { onClick, icon, style = {}, id } = options;

  return {
    id,
    header: '',
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
