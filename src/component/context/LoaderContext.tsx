import { createContext, useContext } from 'react';

interface Loader {
  open: () => void;
}

const LoaderContext = createContext<Loader>({ open: () => null });

export const LoaderProvider = LoaderContext.Provider;

export function useLoader() {
  return useContext(LoaderContext);
}
