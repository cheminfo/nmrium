import { createContext, useContext, useMemo } from 'react';

import type {
  PreferencesState,
  WorkspaceWithSource,
} from '../reducer/preferences/preferencesReducer.js';
import { preferencesInitialState } from '../reducer/preferences/preferencesReducer.js';
import { isReadOnlyWorkspace } from '../reducer/preferences/utilities/isReadOnlyWorkspace.js';

interface PreferencesContextData extends PreferencesState {
  isCurrentWorkspaceReadOnly: boolean;
  current: WorkspaceWithSource;
}

const PreferencesContext = createContext<PreferencesState>(
  preferencesInitialState,
);
export const PreferencesProvider = PreferencesContext.Provider;

export function usePreferences(): PreferencesContextData {
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
      const { visible, source } = workspaces[key];
      return {
        key,
        ...workspaces[key],
        visible: !(source === 'predefined' && !visible),
      };
    });
  }, [workspaces]);
}
