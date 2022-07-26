import { Draft } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function setPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    const { key, value } = action.payload;
    let localData = getLocalStorage('nmr-general-settings');
    localData.workspaces[draft.workspace.current].formatting.panels[key] =
      value;
    storeData('nmr-general-settings', JSON.stringify(localData));
    currentWorkspacePreferences.formatting.panels[key] = value;
  }
}
