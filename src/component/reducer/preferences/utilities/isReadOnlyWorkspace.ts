import { Draft } from 'immer';

import { PreferencesState } from '../preferencesReducer';

export function isReadOnlyWorkspace(
  draft: Draft<PreferencesState> | PreferencesState,
) {
  if (
    Object.values(draft.workspacesTempKeys).includes(draft.workspace.current)
  ) {
    return true;
  } else {
    return false;
  }
}
