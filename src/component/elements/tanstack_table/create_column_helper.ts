import type { ColumnHelper } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';

import type { TanStackTableFeatures } from './features.ts';
import type { TanStackRowData } from './types.ts';

export function createTanStackColumnHelper<
  TData extends TanStackRowData,
>(): ColumnHelper<TanStackTableFeatures, TData> {
  return createColumnHelper<TanStackTableFeatures, TData>();
}
