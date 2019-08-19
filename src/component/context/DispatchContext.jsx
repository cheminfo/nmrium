import { createContext, useContext } from 'react';

export const dispatchContext = createContext();

export const DispatchProvider = dispatchContext.Provider;

export function useDispatch() {
  return useContext(dispatchContext);
}
