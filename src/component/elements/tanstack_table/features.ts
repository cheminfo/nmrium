import {
  cellSpanningFeature,
  createSortedRowModel,
  metaHelper,
  rowSortingFeature,
  sortFn_alphanumeric as sortFnAlphanumeric,
  sortFn_basic as sortFnBasic,
  sortFn_datetime as sortFnDatetime,
  sortFn_text as sortFnText,
  tableFeatures,
} from '@tanstack/react-table';
import type { CSSProperties } from 'react';

interface TanStackTableColumnMeta {
  style?: CSSProperties;
  thStyle?: CSSProperties;
  tdStyle?: CSSProperties;
}

export const tanStackTableFeatures = tableFeatures({
  cellSpanningFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFnAlphanumeric,
    basic: sortFnBasic,
    datetime: sortFnDatetime,
    text: sortFnText,
  },
  columnMeta: metaHelper<TanStackTableColumnMeta>(),
});

export type TanStackTableFeatures = typeof tanStackTableFeatures;
