import type { Draft } from 'immer';

import type { PreferencesState } from '../preferencesReducer.js';

export function isReadOnlyWorkspace(
  draft: Draft<PreferencesState> | PreferencesState,
) {
  return draft.workspaces[draft.workspace.current]?.source !== 'user';
}
