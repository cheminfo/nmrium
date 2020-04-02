import { createContext, useContext } from 'react';

export const Dispatch2DContext = createContext();

export const Dispatch2DProvider = Dispatch2DContext.Provider;

export function use2DDispatch() {
  return useContext(Dispatch2DContext);
}
