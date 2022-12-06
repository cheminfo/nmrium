import { Draft } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';
import { mapNucleiFormatting } from '../utilities/mapNucleiFormatting';

export function setPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    let { formatting, ...restPreferences } = action.payload;
    formatting = mapNucleiFormatting(formatting);
    let localData = getLocalStorage('nmr-general-settings');
    localData.currentWorkspace = draft.workspace.current;

    if (!draft.customWorkspaces[draft.workspace.current]) {
      localData.workspaces = {
        ...localData.workspaces,
        [draft.workspace.current]: {
          ...localData.workspaces[draft.workspace.current],
          ...restPreferences,
          formatting,
        },
      };

      const currentWorkspacePreferences = getActiveWorkspace(draft);
      draft.workspaces[draft.workspace.current] = {
        ...currentWorkspacePreferences,
        ...restPreferences,
        formatting,
      };
    }

    storeData('nmr-general-settings', JSON.stringify(localData));
  }
}
