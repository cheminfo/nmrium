import { createContext, useContext } from 'react';

import { TableVirtualBoundary } from '../ReactTable';

const reactContext = createContext<TableVirtualBoundary | null>(null);
export const ReactTableProvider = reactContext.Provider;

export function useReactTableContext() {
  const context = useContext(reactContext);
  if (!context) {
    throw new Error('react table context was not found ');
  }
  return context;
}
