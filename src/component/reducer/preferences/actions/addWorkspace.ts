import { v4 } from '@lukeed/uuid';
import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import {
  AddWorkspaceAction,
  PreferencesState,
  WorkspaceWithSource,
} from '../preferencesReducer';

export function addWorkspace(
  draft: Draft<PreferencesState>,
  action: AddWorkspaceAction,
) {
  const { workspace: workspaceName, data } = action.payload;

  const newWorkSpace = lodashMerge(
    {},
    // eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
    data ? data : draft.workspaces[draft.workspace.current],
    {
      version: 1,
      label: workspaceName,
      source: 'user',
    },
  );
  const newWorkspaceKey = v4();
  const localData = getLocalStorage('nmr-general-settings');

  localData.workspaces[newWorkspaceKey] = newWorkSpace;
  storeData('nmr-general-settings', JSON.stringify(localData));
  draft.workspaces[newWorkspaceKey] = newWorkSpace as WorkspaceWithSource;
  draft.originalWorkspaces[newWorkspaceKey] =
    newWorkSpace as WorkspaceWithSource;
  draft.workspace.current = newWorkspaceKey as any;
}
