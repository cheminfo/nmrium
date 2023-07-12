import { createContext, useContext } from 'react';

import { Position, Type } from '../options';

export interface AlertOption {
  position?: Position;
  timeout?: number;
  type?: Type;
  /** CSS string color */
  backgroundColor?: string;
  /** CSS string color */
  color?: string;
  onOpen?: () => void;
}
export interface Alert {
  id: string;
  message?: string;
  options: AlertOption;
  close: () => void;
}
export interface AlertAPI {
  show: (message?: string, options?: AlertOption) => Alert;
  success: (message?: string, options?: AlertOption) => Alert;
  error: (message?: string, options?: AlertOption) => Alert;
  info: (message?: string, options?: AlertOption) => Alert;
  showLoading: (message?: string, options?: AlertOption) => Promise<() => void>;
}

const AlertContext = createContext<AlertAPI | null>(null);

export const AlertProvider = AlertContext.Provider;

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert should be mount into an AlertProvider');
  }

  return context;
}
