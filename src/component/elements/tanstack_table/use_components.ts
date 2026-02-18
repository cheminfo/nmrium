import type { RowData } from '@tanstack/react-table';
import { useMemo } from 'react';

import {
  BaseEmptyState,
  BaseTBody,
  BaseTDBody,
  BaseTDBodyEmpty,
  BaseTFoot,
  BaseTHFoot,
  BaseTHHead,
  BaseTHead,
  BaseTRBody,
  BaseTRBodyEmpty,
  BaseTRFoot,
  BaseTRHead,
  BaseTable,
} from './base_components.tsx';
import type { TableComponents } from './types.tsx';

export function useComponents<Data extends RowData>(
  componentsPartial: Partial<TableComponents<Data>> = {},
): TableComponents<Data> {
  const {
    Table = BaseTable,
    THead = BaseTHead,
    TRHead = BaseTRHead,
    THHead = BaseTHHead,
    TBody = BaseTBody,
    TRBody = BaseTRBody,
    TDBody = BaseTDBody,
    TRBodyEmpty = BaseTRBodyEmpty,
    TDBodyEmpty = BaseTDBodyEmpty,
    EmptyState = BaseEmptyState,
    TFoot = BaseTFoot,
    TRFoot = BaseTRFoot,
    THFoot = BaseTHFoot,
  } = componentsPartial;

  return useMemo<TableComponents<Data>>(
    () => ({
      Table,
      THead,
      TRHead,
      THHead,
      TBody,
      TRBody,
      TDBody,
      TRBodyEmpty,
      TDBodyEmpty,
      EmptyState,
      TFoot,
      TRFoot,
      THFoot,
    }),
    [
      Table,
      THead,
      TRHead,
      THHead,
      TBody,
      TRBody,
      TDBody,
      TRBodyEmpty,
      TDBodyEmpty,
      EmptyState,
      TFoot,
      TRFoot,
      THFoot,
    ],
  );
}
