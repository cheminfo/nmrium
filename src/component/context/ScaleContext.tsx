import { createContext, useContext } from 'react';

import type { ScaleState } from '../reducer/scaleReducer.js';
import { scaleInitialState } from '../reducer/scaleReducer.js';

export const scaleContext = createContext<ScaleState>(scaleInitialState);
export const ScaleProvider = scaleContext.Provider;

export function useScale() {
  return useContext(scaleContext);
}

type CheckedScaleState = {
  [key in keyof ScaleState]: Exclude<ScaleState[key], null>;
};

export function useScaleChecked(): CheckedScaleState {
  const scale = useScale();

  if (!scale.scaleX || !scale.scaleY) {
    throw new Error('scale cannot be null');
  }

  return scale as CheckedScaleState;
}
