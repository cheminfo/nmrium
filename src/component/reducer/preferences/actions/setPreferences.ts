import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';
import { mapNucleiFormatting } from '../utilities/mapNucleiFormatting';

export function setPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    let currentWorkspacePreferences = getActiveWorkspace(draft);

    let { general, formatting, display, databases } = action.payload;
    formatting = mapNucleiFormatting(formatting);
    let localData = getLocalStorage('nmr-general-settings');
    localData.currentWorkspace = draft.workspace.current;
    localData.workspaces = {
      ...localData.workspaces,
      [draft.workspace.current]: {
        ...localData.workspaces[draft.workspace.current],
        general,
        formatting,
        display,
        databases,
      },
    };

    storeData('nmr-general-settings', JSON.stringify(localData));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentWorkspacePreferences = lodashMerge(currentWorkspacePreferences, {
      general,
      formatting,
      databases,
      display,
    });
  }
}
