import React, { useContext } from 'react';

export const scaleConetxt = React.createContext();

export const ScaleProvider = scaleConetxt.Provider;

export function useScale() {
  return useContext(scaleConetxt);
}
