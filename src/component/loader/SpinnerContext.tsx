import { createContext, ReactElement } from 'react';

import DefaultSpinnerComponent from './DefaultSpinnerComponent';

export function defaultGetSpinner() {
  return <DefaultSpinnerComponent />;
}

export const spinnerContext =
  createContext<() => ReactElement>(defaultGetSpinner);

export const SpinnerProvider = spinnerContext.Provider;
