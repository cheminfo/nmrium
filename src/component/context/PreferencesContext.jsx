import React, { useContext } from 'react';

export const PreferencesConext = React.createContext();

export const PreferencesProvider = PreferencesConext.Provider;

export function usePreferences() {
  return useContext(PreferencesConext);
}
