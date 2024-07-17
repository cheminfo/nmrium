import { produce } from 'immer';
import { createContext, useContext } from 'react';

import { usePrintPage } from '../elements/print';
import { initialState, State } from '../reducer/Reducer';

export const ChartContext = createContext<State>(initialState);
export const ChartDataProvider = ChartContext.Provider;

export function useChartData() {
  const data = useContext(ChartContext);

  const printOptions = usePrintPage();

  if (!printOptions) return data;

  const { width, height } = printOptions;

  const updatedData = produce(data, (draft) => {
    draft.width = width;
    draft.height = height;
  });

  return updatedData;
}
