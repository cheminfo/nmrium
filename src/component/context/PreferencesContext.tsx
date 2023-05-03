import { createContext, useContext, useMemo } from 'react';

import {
  preferencesInitialState,
  PreferencesState,
  WorkspaceWithSource,
} from '../reducer/preferences/preferencesReducer';
import { isReadOnlyWorkspace } from '../reducer/preferences/utilities/isReadOnlyWorkspace';

export interface PreferencesContextData extends PreferencesState {
  isCurrentWorkspaceReadOnly: boolean;
  current: WorkspaceWithSource;
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

  const { workspace, workspaces } = context;

  return useMemo(() => {
    return {
      ...context,
      current: workspaces?.[workspace.current] || workspaces.default,
      isCurrentWorkspaceReadOnly: isReadOnlyWorkspace(context),
    };
  }, [workspaces, workspace, context]);
}

export function useWorkspacesList() {
  const { workspaces } = usePreferences();
  return useMemo(() => {
    return Object.keys(workspaces).map((key) => {
      const { visible, source } = workspaces[key] as WorkspaceWithSource;
      return {
        key,
        ...workspaces[key],
        visible: !(source === 'predefined' && !visible),
      };
    });
  }, [workspaces]);
}
