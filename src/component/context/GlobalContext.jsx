import React, { useContext } from 'react';

export const GlobalConetxt = React.createContext();

export const GlobalProvider = GlobalConetxt.Provider;

export function useGlobal() {
  return useContext(GlobalConetxt);
}
