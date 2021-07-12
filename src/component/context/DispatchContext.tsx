import { createContext, useContext } from 'react';

export const dispatchContext = createContext<any>({});

export const DispatchProvider = dispatchContext.Provider;

export function useDispatch() {
  return useContext(dispatchContext);
}
