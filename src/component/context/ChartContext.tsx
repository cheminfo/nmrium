import { createContext, useContext } from 'react';

import { initialState, State } from '../reducer/Reducer';

export const ChartContext = createContext<State>(initialState);
export const ChartDataProvider = ChartContext.Provider;

export function useChartData() {
  return useContext(ChartContext);
}
