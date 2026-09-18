import { createContext, use } from 'react';

function defaultLoader() {
  // Empty
}

export const LoaderContext = createContext<() => void>(defaultLoader);

export function useLoader() {
  return use(LoaderContext);
}
