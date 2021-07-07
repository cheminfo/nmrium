import { createContext, useContext } from 'react';

import { scaleInitialState, ScaleState } from '../reducer/scaleReducer';

export const scaleContext = createContext<ScaleState>(scaleInitialState);
export const ScaleProvider = scaleContext.Provider;

export function useScale() {
  return useContext(scaleContext);
}
