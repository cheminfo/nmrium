import type {
  CellData,
  ColumnDef,
  Header,
  HeaderGroup,
  ReactTable,
  Row,
  RowData,
} from '@tanstack/react-table';
import type { CSSProperties, MouseEvent } from 'react';

import type {
  HighlightEventSourceExtra,
  HighlightEventSourceType,
} from '../../highlight/index.tsx';
import type { BaseContextMenuProps } from '../ContextMenuBluePrint.tsx';

import type { TanStackTableFeatures } from './features.ts';

type TanStackCellData = CellData;
export type TanStackRowData = RowData;

export type TanStackReactTable<TData extends TanStackRowData> = ReactTable<
  TanStackTableFeatures,
  TData
>;

export type TanStackTableRow<TData extends TanStackRowData> = Row<
  TanStackTableFeatures,
  TData
>;

export type TanStackTableColumn<
  TData extends TanStackRowData,
  TValue extends TanStackCellData = TanStackCellData,
> = ColumnDef<TanStackTableFeatures, TData, TValue>;

export type TanStackTableHeader<
  TData extends TanStackRowData,
  TValue extends TanStackCellData = TanStackCellData,
> = Header<TanStackTableFeatures, TData, TValue>;

export type TanStackTableHeaderGroup<TData extends TanStackRowData> =
  HeaderGroup<TanStackTableFeatures, TData>;

export type TanStackTableHighlightSourceProps<TData extends TanStackRowData> = {
  [K in HighlightEventSourceType]: HighlightEventSourceExtra<K> extends never
    ? { highlightedSource?: K; getHighlightExtra?: never }
    : {
        highlightedSource: K;
        getHighlightExtra: (row: TData) => HighlightEventSourceExtra<K>;
      };
}[HighlightEventSourceType];

export interface TanStackTableRowStyle {
  active?: CSSProperties;
  activated?: CSSProperties;
  hover?: CSSProperties;
  base?: CSSProperties;
}

export interface TanStackTableContextMenuProps<TData extends TanStackRowData> {
  contextMenu?: BaseContextMenuProps['options'];
  onContextMenuSelect?: (
    selected: Parameters<BaseContextMenuProps['onSelect']>[0],
    data: TData,
  ) => void;
}

export interface TanStackTableClickEvent<TData extends TanStackRowData> {
  onClick?: (event: MouseEvent, row: TanStackTableRow<TData>) => void;
}

export interface TanStackTableSortEvent<TData extends TanStackRowData> {
  onSortEnd?: (data: TData[], isTableSorted?: boolean) => void;
}

interface VirtualBoundary {
  start: number;
  end: number;
}

export interface TanStackTableVirtualBoundary {
  rows: VirtualBoundary;
  columns: VirtualBoundary;
}
