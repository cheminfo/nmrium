import { Draft } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState, WorkspaceAction } from '../preferencesReducer';

export function removeWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  const { workspace } = action.payload;

  if (workspace === draft.workspace.current) {
    draft.workspace.current = 'default';
  }

  const localData = getLocalStorage('nmr-general-settings');
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete draft.workspaces[workspace];
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete localData.workspaces[workspace];
  storeData('nmr-general-settings', JSON.stringify(localData));
}
