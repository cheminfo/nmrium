import { createContext, useContext } from 'react';

type Dispatch = (action: { type: string; payload?: any }) => void;

export const dispatchContext = createContext<Dispatch>(() => null);

export const DispatchProvider = dispatchContext.Provider;

export function useDispatch(): Dispatch {
  return useContext(dispatchContext);
}
