import type { ReactElement } from 'react';
import { createContext } from 'react';

import DefaultSpinnerComponent from './DefaultSpinnerComponent.js';

export function defaultGetSpinner(loadingText = 'Loading ...') {
  return <DefaultSpinnerComponent loadingText={loadingText} />;
}

export const SpinnerContext =
  createContext<(loadingText?: string) => ReactElement>(defaultGetSpinner);
