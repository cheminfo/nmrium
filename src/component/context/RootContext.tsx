import { createContext, useContext } from 'react';

const rootContext = createContext<HTMLElement | null>(null);

export const RootProvider = rootContext.Provider;

export function useRootElement() {
  if (!rootContext) {
    throw new Error('Root context was not found');
  }
  return useContext(rootContext);
}
