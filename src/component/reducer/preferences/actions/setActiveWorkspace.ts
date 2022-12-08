import { Draft } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState, WorkspaceAction } from '../preferencesReducer';
import { isReadOnlyWorkspace } from '../utilities/isReadOnlyWorkspace';

export function setActiveWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  if (action.payload && !isReadOnlyWorkspace(draft)) {
    const { workspace } = action.payload;
    let localData = getLocalStorage('nmr-general-settings');
    draft.workspace.current = workspace;
    localData.currentWorkspace = workspace;
    storeData('nmr-general-settings', JSON.stringify(localData));
  }
}
