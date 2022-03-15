import { createContext, useContext } from 'react';

import {
  preferencesInitialState,
  PreferencesState,
} from '../reducer/preferencesReducer';

export const PreferencesContext = createContext<PreferencesState>(
  preferencesInitialState,
);
export const PreferencesProvider = PreferencesContext.Provider;

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('Preferences context was not found');
  }

  const { workspace, workspaces, dispatch } = context;
  return { ...(workspaces[workspace] || {}), workspace, dispatch };
}
