import { produce } from 'immer';
import { createContext, useContext } from 'react';

import { useViewportSize } from '../hooks/useViewportSize.js';
import type { State } from '../reducer/Reducer.js';
import { initialState } from '../reducer/Reducer.js';

export const ChartContext = createContext<State>(initialState);
export const ChartDataProvider = ChartContext.Provider;

export function useChartData() {
  const data = useContext(ChartContext);

  const viewportSize = useViewportSize();

  if (!viewportSize) return data;

  const { width, height, margin, xDomain, yDomain } = viewportSize;
  const updatedData = produce(data, (draft) => {
    draft.width = width;
    draft.height = height;
    draft.margin = margin ?? draft.margin;
    draft.xDomain = xDomain ?? draft.xDomain;
    draft.yDomain = yDomain ?? draft.yDomain;
  });

  return updatedData;
}
