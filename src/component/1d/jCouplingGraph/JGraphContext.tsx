import { ScaleLinear } from 'd3';
import { useContext, createContext } from 'react';

interface JGraphState {
  scaleY: ScaleLinear<number, number, never> | null;
  height: number;
  maxValue: number;
}

const JGraphContext = createContext<JGraphState>({
  scaleY: null,
  height: 0,
  maxValue: 0,
});

export const JGraphContextProvider = JGraphContext.Provider;

export function useJGraph() {
  const jGraphState = useContext(JGraphContext);
  if (!jGraphState.scaleY) {
    throw new Error('scale cannot be null');
  }

  return jGraphState;
}
