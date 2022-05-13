import { Draft } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilites/getActiveWorkspace';
import { mapNucleiFormatting } from '../utilites/mapNucleiFormatting';

export function setPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    let { controllers, formatting, display, databases } = action.payload;
    formatting = mapNucleiFormatting(formatting);
    let localData = getLocalStorage('nmr-general-settings');
    localData.currentWorkspace = draft.workspace.current;
    localData.workspaces = {
      ...localData.workspaces,
      [draft.workspace.current]: {
        ...localData.workspaces[draft.workspace.current],
        controllers,
        formatting,
        display,
        databases,
      },
    };

    storeData('nmr-general-settings', JSON.stringify(localData));

    currentWorkspacePreferences.controllers = controllers;
    currentWorkspacePreferences.formatting = formatting;
    currentWorkspacePreferences.databases = databases;
    currentWorkspacePreferences.display = {
      ...currentWorkspacePreferences.display,
      panels: display.panels,
      general: {
        ...(currentWorkspacePreferences.display.general || {}),
        experimentalFeatures: display.general.experimentalFeatures,
      },
    };
  }
}
