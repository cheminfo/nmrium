import { createContext, use } from 'react';

import { useInsetViewerRootRef } from '../1d/inset/InsetViewerRoot.js';

export const GlobalContext = createContext<{
  rootRef: HTMLDivElement | null;
  elementsWrapperRef: HTMLDivElement | null;
  viewerRef: HTMLDivElement | null;
}>({ rootRef: null, elementsWrapperRef: null, viewerRef: null });

export function useGlobal() {
  const insetViewerRootRef = useInsetViewerRootRef();
  const context = use(GlobalContext);

  if (!insetViewerRootRef) return context;

  const { viewerRef, ...otherRef } = context;
  return { viewerRef: insetViewerRootRef || viewerRef, ...otherRef };
}
