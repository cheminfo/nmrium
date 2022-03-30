import { createContext, useContext, useMemo } from 'react';

import {
  preferencesInitialState,
  PreferencesState,
  WORKSPACES,
} from '../reducer/preferencesReducer';
import Workspaces from '../workspaces';

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

  return useMemo(() => {
    return {
      current: workspaces[workspace.current] || {},
      workspace,
      workspaces,
      dispatch,
    };
  }, [dispatch, workspace, workspaces]);
}

export function useWorkspacesList() {
  const { workspaces } = usePreferences();
  return useMemo(() => {
    const currentWorkspaces = Object.keys(workspaces).reduce<
      { key: string; label: string }[]
    >((acc, key) => {
      if (!Workspaces[key]) {
        acc.push({ key, label: workspaces[key].label });
      }
      return acc;
    }, []);

    return [...WORKSPACES, ...currentWorkspaces];
  }, [workspaces]);
}
