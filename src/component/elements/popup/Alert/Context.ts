import { createContext, useContext } from 'react';

const AlertContext = createContext<any>({});

export const AlertProvider = AlertContext.Provider;

export function useAlert() {
  return useContext(AlertContext);
}
