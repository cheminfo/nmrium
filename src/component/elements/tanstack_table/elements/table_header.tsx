import type { CSSProperties, MouseEvent } from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

import type {
  TanStackReactTable,
  TanStackRowData,
  TanStackTableHeader,
  TanStackTableHeaderGroup,
} from '../types.ts';

interface TableCellEvent {
  onClick: (e: MouseEvent<HTMLTableCellElement>) => void;
}

interface TableHeaderProps<
  TData extends TanStackRowData,
> extends TableCellEvent {
  headerGroups: Array<TanStackTableHeaderGroup<TData>>;
  table: TanStackReactTable<TData>;
}

const sortIconStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: '2px',
};

export default function TableHeader<TData extends TanStackRowData>(
  props: TableHeaderProps<TData>,
) {
  const { headerGroups, table, onClick } = props;
  return (
    <thead>
      {headerGroups.map((headerGroup) => {
        return (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <HeaderCell
                key={header.id}
                header={header}
                table={table}
                onClick={onClick}
              />
            ))}
          </tr>
        );
      })}
    </thead>
  );
}

interface HeaderCellProps<
  TData extends TanStackRowData,
> extends TableCellEvent {
  header: TanStackTableHeader<TData>;
  table: TanStackReactTable<TData>;
}

function HeaderCell<TData extends TanStackRowData>(
  props: HeaderCellProps<TData>,
) {
  const { header, table, onClick } = props;

  const meta = header.column.columnDef.meta;
  const canSort = header.column.getCanSort();
  const toggleSortingHandler = canSort
    ? header.column.getToggleSortingHandler()
    : undefined;
  const isSorted = header.column.getIsSorted();

  function clickHandler(event: MouseEvent<HTMLTableCellElement>) {
    if (toggleSortingHandler) {
      toggleSortingHandler(event);
      onClick(event);
    }
  }

  return (
    <th
      colSpan={header.colSpan}
      style={{
        height: '1px',
        cursor: canSort ? 'pointer' : undefined,
        ...meta?.style,
        ...meta?.thStyle,
      }}
      title={
        canSort
          ? header.column.getNextSortingOrder() === 'asc'
            ? 'Sort ascending'
            : header.column.getNextSortingOrder() === 'desc'
              ? 'Sort descending'
              : 'Clear sort'
          : undefined
      }
      onClick={clickHandler}
    >
      <span style={sortIconStyle}>
        {isSorted ? (
          isSorted === 'desc' ? (
            <FaSortAmountDown />
          ) : (
            <FaSortAmountUp />
          )
        ) : null}
      </span>
      <table.FlexRender header={header} />
    </th>
  );
}
