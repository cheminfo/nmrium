import { Draft } from 'immer';

import { PreferencesState, WorkspaceAction } from '../preferencesReducer';

export function setActiveWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  if (action.payload) {
    const { workspace } = action.payload;
    draft.workspace.current = workspace;
  }
}
