import { Draft } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function setPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    const { key, value } = action.payload;
    const localData = getLocalStorage('nmr-general-settings');
    const panels =
      localData.workspaces[draft.workspace.current].formatting.panels;

    if (value?.nuclei) {
      const { nuclei, ...commonPreferences } = value;
      panels[key] = {
        ...commonPreferences,
        nuclei: { ...panels[key]?.nuclei, ...nuclei },
      };
    } else {
      panels[key] = value;
    }

    storeData('nmr-general-settings', JSON.stringify(localData));
    currentWorkspacePreferences.formatting.panels[key] = panels[key];
  }
}
