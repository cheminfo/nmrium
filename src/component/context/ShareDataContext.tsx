import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

interface ShareDataState<T> {
  data: T | null;
  setData: (data: T) => void;
}

const ShareDataContext = createContext<ShareDataState<any> | null>(null);

export function useShareData<T>(): ShareDataState<T> {
  const context = useContext(ShareDataContext) as ShareDataState<T>;

  if (!context) {
    throw new Error('useShareData must be used within an ShareDataProvider');
  }

  return context;
}

export function ShareDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<unknown | null>(null);

  const state = useMemo(() => {
    return {
      data,
      setData,
    };
  }, [data]);

  return (
    <ShareDataContext.Provider value={state}>
      {children}
    </ShareDataContext.Provider>
  );
}
