import { createContext, useContext } from 'react';

export const ChartContext = createContext();

export const ChartDataProvider = ChartContext.Provider;

export function useChartData() {
  return useContext(ChartContext);
}
