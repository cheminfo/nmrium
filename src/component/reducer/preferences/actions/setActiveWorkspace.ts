import type { Draft } from 'immer';

import type {
  PreferencesState,
  WorkspaceAction,
} from '../preferencesReducer.js';

export function setActiveWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  if (action.payload) {
    const { workspace } = action.payload;
    draft.workspace.current = workspace;
  }
}
