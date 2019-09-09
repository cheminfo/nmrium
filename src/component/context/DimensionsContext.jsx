import { createContext, useContext } from 'react';

export const DimensionContext = createContext();

export const DimensionProvider = DimensionContext.Provider;


export function useDimension() {
  return useContext(DimensionContext);
}
