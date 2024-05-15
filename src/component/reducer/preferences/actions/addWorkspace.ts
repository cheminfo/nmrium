import { Draft } from 'immer';

import {
  AddWorkspaceAction,
  PreferencesState,
  WorkspaceWithSource,
} from '../preferencesReducer';

export function addWorkspace(
  draft: Draft<PreferencesState>,
  action: AddWorkspaceAction,
) {
  const { workspaceKey, data } = action.payload;
  if (data) {
    draft.workspaces[workspaceKey] = data as WorkspaceWithSource;
    draft.originalWorkspaces[workspaceKey] = data as WorkspaceWithSource;
    draft.workspace.current = workspaceKey as any;
  }
}
