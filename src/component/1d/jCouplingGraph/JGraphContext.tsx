import type { ScaleLinear } from 'd3-scale';
import { createContext, use } from 'react';

interface JGraphState {
  scaleY: ScaleLinear<number, number> | null;
  height: number;
  maxValue: number;
}

export const JGraphContext = createContext<JGraphState>({
  scaleY: null,
  height: 0,
  maxValue: 0,
});

export function useJGraph() {
  const jGraphState = use(JGraphContext);
  if (!jGraphState.scaleY) {
    throw new Error('scale cannot be null');
  }

  return jGraphState;
}
