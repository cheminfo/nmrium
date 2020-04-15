import React, { useContext } from 'react';

export const PanelConext = React.createContext();

export const PanelProvider = PanelConext.Provider;

export function usePanelData() {
  return useContext(PanelConext);
}
