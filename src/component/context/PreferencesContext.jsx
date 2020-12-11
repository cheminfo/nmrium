import { createContext, useContext } from 'react';

export const PreferencesConext = createContext();

export const PreferencesProvider = PreferencesConext.Provider;

export function usePreferences() {
  return useContext(PreferencesConext);
}
