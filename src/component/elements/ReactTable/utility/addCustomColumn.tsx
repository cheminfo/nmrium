import { v4 } from '@lukeed/uuid';
import { CSSProperties, MouseEvent, ReactNode } from 'react';

import { Column } from '../ReactTable';

export type CustomColumn<T extends object> = Column<T> & { index: number };
export type ControlCustomColumn<T extends object> = CustomColumn<T> & {
  showWhen: string;
};

export default function addCustomColumn<T extends object>(
  array,
  options: CustomColumn<T>,
) {
  const {
    index,
    Header = () => null,
    accessor = null,
    Cell = null,
    sortType = 'basic',
    enableRowSpan = false,
    style = {},
    id,
  } = options || {};

  array.push({
    index,
    ...(id && { id }),
    ...(accessor && { accessor }),
    ...(Cell && { Cell }),
    Header,
    sortType,
    enableRowSpan,
    style,
  });
}

interface CreateActionColumnOptions<T extends object> {
  onClick: (row: T | object, even?: MouseEvent<HTMLButtonElement>) => void;
  icon: ReactNode;
  style?: CSSProperties;
  index: number;
}

export function createActionColumn<T extends object>(
  options: CreateActionColumnOptions<T>,
): CustomColumn<T> {
  const { onClick, icon, index, style = {} } = options;

  return {
    index,
    Header: '',
    style: {
      width: '1%',
      maxWidth: '20px',
      minWidth: '20px',
      padding: '0px',
      textAlign: 'center',
      ...style,
    },
    id: v4(),
    Cell: ({ row }) => (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(row, e);
        }}
      >
        {icon}
      </button>
    ),
  };
}
