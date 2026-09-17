import type { PropsWithChildren } from 'react';
import { createContext, use, useRef } from 'react';

const InsetViewRefContext = createContext<HTMLDivElement | null>(null);

export function useInsetViewerRootRef() {
  return use(InsetViewRefContext);
}

export function InsetViewerRoot({ children }: Required<PropsWithChildren>) {
  const insetRootRef = useRef<HTMLDivElement | null>(null);

  return (
    <InsetViewRefContext value={insetRootRef.current}>
      <div ref={insetRootRef} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </InsetViewRefContext>
  );
}
