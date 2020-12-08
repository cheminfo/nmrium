import { createContext, useContext } from 'react';

const AlertContext = createContext();

export const AlertProvider = AlertContext.Provider;

export const useAlert = () => {
  return useContext(AlertContext);
};
