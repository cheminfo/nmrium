import { Draft } from 'immer';

import {
  ApplyGeneralPreferences,
  PreferencesState,
  WorkspaceWithSource,
} from '../preferencesReducer';

export function applyGeneralPreferences(
  draft: Draft<PreferencesState>,
  action: ApplyGeneralPreferences,
) {
  const { data } = action.payload;

  draft.workspaces[draft.workspace.current] = data as WorkspaceWithSource;
}
