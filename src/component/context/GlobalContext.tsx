import { createContext, useContext } from 'react';

export const GlobalConetxt = createContext<{
  rootRef: HTMLDivElement | null;
  elementsWrapperRef: HTMLDivElement | null;
  viewerRef: HTMLDivElement | null;
}>({ rootRef: null, elementsWrapperRef: null, viewerRef: null });

export const GlobalProvider = GlobalConetxt.Provider;

export function useGlobal() {
  return useContext(GlobalConetxt);
}
