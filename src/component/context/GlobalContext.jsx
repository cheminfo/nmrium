import { createContext, useContext } from 'react';

export const GlobalConetxt = createContext();

export const GlobalProvider = GlobalConetxt.Provider;

export function useGlobal() {
  return useContext(GlobalConetxt);
}
