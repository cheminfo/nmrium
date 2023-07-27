import { v4 } from '@lukeed/uuid';
import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';
import {
  AddWorkspaceAction,
  PreferencesState,
  WorkspaceWithSource,
} from '../preferencesReducer';

export function addWorkspace(
  draft: Draft<PreferencesState>,
  action: AddWorkspaceAction,
) {
  const { workspaceKey, data } = action.payload;

  // eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
  const workSpaceData = data
    ? data
    : draft.workspaces?.[draft.workspace.current];

  if (workSpaceData) {
    const newWorkSpace = lodashMerge(
      {},
      workspaceDefaultProperties,
      workSpaceData,
      {
        version: 1,
        label: workspaceKey,
        source: 'user',
      },
    );
    const newWorkspaceKey = v4();
    const localData = getLocalStorage('nmr-general-settings');
    localData.currentWorkspace = newWorkspaceKey;
    localData.workspaces[newWorkspaceKey] = newWorkSpace;
    storeData('nmr-general-settings', JSON.stringify(localData));
    draft.workspaces[newWorkspaceKey] = newWorkSpace as WorkspaceWithSource;
    draft.originalWorkspaces[newWorkspaceKey] =
      newWorkSpace as WorkspaceWithSource;
    draft.workspace.current = newWorkspaceKey as any;
  }
}
