import React, { createContext, useContext, useMemo, useState } from 'react';

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

export function ShareDataProvider<T>({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<T | null>(null);

  const state = useMemo(() => {
    return {
      data,
      setData: (newData: T) => {
        setData(newData);
      },
    };
  }, [data]);

  return (
    <ShareDataContext.Provider value={state}>
      {children}
    </ShareDataContext.Provider>
  );
}