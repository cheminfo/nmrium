import { createContext, useContext, useMemo } from 'react';

import {
  preferencesInitialState,
  PreferencesState,
} from '../reducer/preferences/preferencesReducer';
import { isReadOnlyWorkspace } from '../reducer/preferences/utilities/isReadOnlyWorkspace';

export interface PreferencesContextData extends PreferencesState {
  isCurrentWorkspaceReadOnly: boolean;
}

export const PreferencesContext = createContext<PreferencesState>(
  preferencesInitialState,
);
export const PreferencesProvider = PreferencesContext.Provider;

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('Preferences context was not found');
  }

  const { workspace, workspaces, originalWorkspaces, dispatch } = context;

  return useMemo(() => {
    return {
      current: workspaces[workspace.current] || {},
      workspace,
      workspaces,
      originalWorkspaces,
      dispatch,
      isCurrentWorkspaceReadOnly: isReadOnlyWorkspace(context),
    };
  }, [workspaces, workspace, originalWorkspaces, dispatch, context]);
}

export function useWorkspacesList() {
  const { workspaces } = usePreferences();
  return useMemo(() => {
    return Object.keys(workspaces).map((key) => ({
      key,
      ...workspaces[key],
    }));
  }, [workspaces]);
}
