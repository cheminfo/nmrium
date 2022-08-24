import { createContext, useContext } from 'react';

export const GlobalContext = createContext<{
  rootRef: HTMLDivElement | null;
  elementsWrapperRef: HTMLDivElement | null;
  viewerRef: HTMLDivElement | null;
}>({ rootRef: null, elementsWrapperRef: null, viewerRef: null });

export const GlobalProvider = GlobalContext.Provider;

export function useGlobal() {
  return useContext(GlobalContext);
}
