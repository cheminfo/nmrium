import { createContext, useContext } from 'react';

export const DomainContext = createContext();
export const DomainProvider = DomainContext.Provider;

export function useDomain() {
  return useContext(DomainContext);
}
