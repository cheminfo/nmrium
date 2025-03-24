import { createContext, useContext } from 'react';

import { useInsetViewerRootRef } from '../1d/inset/InsetViewerRoot.js';

const GlobalContext = createContext<{
  rootRef: HTMLDivElement | null;
  elementsWrapperRef: HTMLDivElement | null;
  viewerRef: HTMLDivElement | null;
}>({ rootRef: null, elementsWrapperRef: null, viewerRef: null });

export const GlobalProvider = GlobalContext.Provider;

export function useGlobal() {
  const insetViewerRootRef = useInsetViewerRootRef();
  const context = useContext(GlobalContext);

  if (!insetViewerRootRef) return context;

  const { viewerRef, ...otherRef } = context;
  return { viewerRef: insetViewerRootRef || viewerRef, ...otherRef };
}
