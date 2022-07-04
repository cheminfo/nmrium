import { Draft } from 'immer';

import generateID from '../../../../data/utilities/generateID';
import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { AddWorkspaceAction, PreferencesState } from '../preferencesReducer';

export function addWorkspace(
  draft: Draft<PreferencesState>,
  action: AddWorkspaceAction,
) {
  const {
    workspace: workspaceName,
    data: { display, general, formatting, databases },
  } = action.payload;
  const newWorkSpace = {
    version: 1,
    label: workspaceName,
    display,
    general,
    formatting,
    databases,
  };
  const newWorkspaceKey = generateID();
  const localData = getLocalStorage('nmr-general-settings');

  localData.workspaces[newWorkspaceKey] = newWorkSpace;
  storeData('nmr-general-settings', JSON.stringify(localData));
  draft.workspaces[newWorkspaceKey] = newWorkSpace;
  draft.workspace.current = newWorkspaceKey as any;
}
