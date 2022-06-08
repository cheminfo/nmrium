import { createContext, ReactElement } from 'react';

import DefaultSpinnerComponent from './DefaultSpinnerComponent';

export function defaultGetSpinner(loadingText = 'Loading ...') {
  return <DefaultSpinnerComponent loadingText={loadingText} />;
}

export const spinnerContext =
  createContext<(loadingText?: string) => ReactElement>(defaultGetSpinner);

export const SpinnerProvider = spinnerContext.Provider;
