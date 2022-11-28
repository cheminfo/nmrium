import { createContext, useContext, useMemo } from 'react';

import {
  preferencesInitialState,
  PreferencesState,
} from '../reducer/preferences/preferencesReducer';

export const PreferencesContext = createContext<PreferencesState>(
  preferencesInitialState,
);
export const PreferencesProvider = PreferencesContext.Provider;

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('Preferences context was not found');
  }

  const { workspace, workspaces, customWorkspaces, dispatch } = context;

  return useMemo(() => {
    return {
      current: workspaces[workspace.current] || {},
      workspace,
      workspaces,
      customWorkspaces,
      dispatch,
    };
  }, [customWorkspaces, dispatch, workspace, workspaces]);
}

export function useWorkspacesList() {
  const { workspaces } = usePreferences();
  return useMemo(() => {
    return Object.keys(workspaces).map((key) => ({
      key,
      label: workspaces[key].label,
    }));
  }, [workspaces]);
}
