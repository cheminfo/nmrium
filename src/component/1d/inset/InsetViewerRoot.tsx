import { createContext, useContext, useRef } from 'react';

const InsetViewRefContext = createContext<HTMLDivElement | null>(null);

export function useInsetViewerRootRef() {
  return useContext(InsetViewRefContext);
}

export function InsetViewerRoot({ children }) {
  const insetRootRef = useRef<HTMLDivElement | null>(null);

  return (
    <InsetViewRefContext.Provider value={insetRootRef.current}>
      <div ref={insetRootRef} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </InsetViewRefContext.Provider>
  );
}
