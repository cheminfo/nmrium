import { createContext, useContext } from 'react';

const ModalContext = createContext();
export const ModalProvider = ModalContext.Provider;

export const useModal = () => {
  return useContext(ModalContext);
};
