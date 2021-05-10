import { createContext, useContext } from 'react';

const AlertContext = createContext();

export const AlertProvider = AlertContext.Provider;

export function useAlert() {
  return useContext(AlertContext);
}
