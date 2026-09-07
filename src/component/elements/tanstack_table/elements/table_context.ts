import { createContext, useContext } from 'react';

import type { TanStackTableVirtualBoundary } from '../types.ts';

const reactContext = createContext<TanStackTableVirtualBoundary | null>(null);

export const TanStackTableProvider = reactContext.Provider;

export function useTanStackTableContext() {
  const context = useContext(reactContext);
  if (!context) {
    throw new Error('table context was not found');
  }
  return context;
}
