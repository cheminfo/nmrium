import { Draft } from 'immer';

import { PreferencesState } from '../preferencesReducer';

export function isReadOnlyWorkspace(
  draft: Draft<PreferencesState> | PreferencesState,
) {
  return draft.workspaces[draft.workspace.current]?.source !== 'user';
}
