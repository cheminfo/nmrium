import React, { useContext } from 'react';

export const ChartContext = React.createContext();

export const ChartDataProvider = ChartContext.Provider;

export function useChartData() {
  return useContext(ChartContext);
}
