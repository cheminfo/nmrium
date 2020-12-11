import { createContext, useContext } from 'react';

export const scaleContext = createContext();

export const ScaleProvider = scaleContext.Provider;

export function useScale() {
  return useContext(scaleContext);
}
