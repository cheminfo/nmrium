import { createContext, useContext } from 'react';

export const Chart2DContext = createContext();
export const Chart2DProvider = Chart2DContext.Provider;

export function useChart2DData() {
  return useContext(Chart2DContext);
}
