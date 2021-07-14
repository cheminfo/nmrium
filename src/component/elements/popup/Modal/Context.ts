import { createContext, useContext } from 'react';

const ModalContext = createContext<any>({});
export const ModalProvider = ModalContext.Provider;

export function useModal() {
  return useContext(ModalContext);
}
