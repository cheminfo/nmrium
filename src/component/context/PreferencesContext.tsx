import type { Dispatch } from 'react';
import { createContext, useContext, useMemo } from 'react';

import type {
  PreferencesActions,
  PreferencesState,
  WorkspaceWithSource,
} from '../reducer/preferences/preferencesReducer.js';
import { isReadOnlyWorkspace } from '../reducer/preferences/utilities/isReadOnlyWorkspace.js';

export interface PreferencesStateContext extends PreferencesState {
  dispatch: Dispatch<PreferencesActions>;
}

interface PreferencesContextData extends PreferencesStateContext {
  isCurrentWorkspaceReadOnly: boolean;
  current: WorkspaceWithSource;
}

const PreferencesContext = createContext<PreferencesStateContext | null>(null);
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

type ExtendedWorkspace = WorkspaceWithSource & {
  key: string;
  visible: boolean;
};

export function useWorkspacesList(): ExtendedWorkspace[] {
  const { workspaces } = usePreferences();
  return useMemo(() => {
    return Object.entries(workspaces).map(([key, workspace]) => {
      const { visible, source } = workspace;
      return {
        ...workspace,
        key,
        visible: !(source === 'predefined' && !visible),
      };
    });
  }, [workspaces]);
}
