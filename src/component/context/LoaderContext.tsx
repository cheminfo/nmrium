import { createContext, useContext } from 'react';

function defaultLoader() {
  // Empty
}

const LoaderContext = createContext<() => void>(defaultLoader);

export const LoaderProvider = LoaderContext.Provider;

export function useLoader() {
  return useContext(LoaderContext);
}
