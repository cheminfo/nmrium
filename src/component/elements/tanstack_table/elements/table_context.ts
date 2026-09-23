import { createContext, use } from 'react';

import type { TanStackTableVirtualBoundary } from '../types.ts';

export const TanStackTableContext =
  createContext<TanStackTableVirtualBoundary | null>(null);

export function useTanStackTableContext() {
  const context = use(TanStackTableContext);
  if (!context) {
    throw new Error('table context was not found');
  }
  return context;
}
