import { createContext, useContext } from 'react';

const ModalContext = createContext();
export const ModalProvider = ModalContext.Provider;

export function useModal() {
  return useContext(ModalContext);
}
