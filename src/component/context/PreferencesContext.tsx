import { createContext, useContext } from 'react';

import {
  preferencesInitialState,
  PreferencesState,
} from '../reducer/preferencesReducer';

export const PreferencesConext = createContext<PreferencesState>(
  preferencesInitialState,
);
export const PreferencesProvider = PreferencesConext.Provider;

export function usePreferences() {
  return useContext(PreferencesConext);
}
