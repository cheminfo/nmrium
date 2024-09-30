import { produce } from 'immer';
import { createContext, useContext } from 'react';

import { useViewportSize } from '../hooks/useViewportSize';
import { initialState, State } from '../reducer/Reducer';

export const ChartContext = createContext<State>(initialState);
export const ChartDataProvider = ChartContext.Provider;

export function useChartData() {
  const data = useContext(ChartContext);

  const viewportSize = useViewportSize();

  if (!viewportSize) return data;

  const { width, height } = viewportSize;

  const updatedData = produce(data, (draft) => {
    draft.width = width;
    draft.height = height;
  });

  return updatedData;
}
