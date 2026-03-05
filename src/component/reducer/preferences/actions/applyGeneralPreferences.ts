import type { Draft } from 'immer';

import type {
  ApplyGeneralPreferences,
  PreferencesState,
} from '../preferencesReducer.js';

export function applyGeneralPreferences(
  draft: Draft<PreferencesState>,
  action: ApplyGeneralPreferences,
) {
  const { data } = action.payload;

  draft.workspaces[draft.workspace.current] = data;
}
