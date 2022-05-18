import { Draft } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilites/getActiveWorkspace';
import { getPreferencesByWorkspace } from '../utilites/getPreferencesByWorkspace';

export function resetPreferences(draft: Draft<PreferencesState>) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  let localData = getLocalStorage('nmr-general-settings');
  const workSpaceDisplayPreferences = getPreferencesByWorkspace(
    draft.workspace.current,
  ).display;

  if (localData.workspaces[draft.workspace.current]) {
    localData.workspaces[draft.workspace.current].display =
      workSpaceDisplayPreferences;
    storeData('nmr-general-settings', JSON.stringify(localData));
  }
  currentWorkspacePreferences.display = workSpaceDisplayPreferences;
}
