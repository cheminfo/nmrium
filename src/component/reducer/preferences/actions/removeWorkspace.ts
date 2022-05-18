import { Draft, original } from 'immer';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { PreferencesState, WorkspaceAction } from '../preferencesReducer';
import { filterObject } from '../utilites/filterObject';

export function removeWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  const { workspace } = action.payload;

  if (workspace === draft.workspace.current) {
    draft.workspace.current = 'default';
  }

  let localData = getLocalStorage('nmr-general-settings');
  const storedWorkspaces = original(draft)?.workspaces || {};
  const workspaces = Object.keys(storedWorkspaces).reduce((acc, key) => {
    if (key !== workspace) {
      acc[key] = storedWorkspaces[key];
    }
    return acc;
  }, {});
  draft.workspaces = workspaces;
  localData.workspaces = filterObject(workspaces);
  storeData('nmr-general-settings', JSON.stringify(localData));
}
