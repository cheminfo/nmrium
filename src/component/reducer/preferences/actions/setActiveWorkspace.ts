import { Draft } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState, WorkspaceAction } from '../preferencesReducer';

export function setActiveWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  if (action.payload) {
    const { workspace } = action.payload;
    const localData = getLocalStorage('nmr-general-settings');
    draft.workspace.current = workspace;
    localData.currentWorkspace = workspace;
    storeData('nmr-general-settings', JSON.stringify(localData));
  }
}
