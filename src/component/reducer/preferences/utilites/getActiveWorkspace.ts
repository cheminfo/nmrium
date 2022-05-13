import { Draft } from 'immer';

import { PreferencesState } from '../preferencesReducer';

export function getActiveWorkspace(draft: Draft<PreferencesState>) {
  return draft.workspaces[draft.workspace.current || 'default'];
}
