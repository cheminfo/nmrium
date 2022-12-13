import { Draft } from 'immer';
import cloneDeep from 'lodash/cloneDeep';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';
import { mapNucleiFormatting } from '../utilities/mapNucleiFormatting';

export function setPreferences(draft: Draft<PreferencesState>, action) {
  let localData = getLocalStorage('nmr-general-settings');
  const currentWorkspacePreferences = getActiveWorkspace(draft);

  if (action.payload) {
    let { formatting, ...restPreferences } = action.payload;

    formatting = mapNucleiFormatting(formatting);

    draft.workspaces[draft.workspace.current] = {
      ...currentWorkspacePreferences,
      ...restPreferences,
      formatting,
    };
  }

  if (draft.workspaces[draft.workspace.current].source === 'user') {
    draft.workspaces[draft.workspace.current].version++;
    storeData(
      'nmr-general-settings',
      JSON.stringify({
        ...localData,
        workspaces: {
          ...localData.workspaces,
          [draft.workspace.current]: draft.workspaces[draft.workspace.current],
        },
      }),
    );
  }

  draft.originalWorkspaces[draft.workspace.current] = cloneDeep(
    draft.workspaces[draft.workspace.current],
  );
}
