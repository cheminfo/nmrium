import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';
import {
  PreferencesState,
  SetWorkspaceAction,
  WORKSPACES_KEYS,
} from '../preferencesReducer';
import { getPreferencesByWorkspace } from '../utilities/getPreferencesByWorkspace';

export function setWorkspace(
  draft: Draft<PreferencesState>,
  action: SetWorkspaceAction,
) {
  if (action.payload.workspaceSource === 'any') {
    const workspaceKey = action.payload.workspace;
    if (!draft.workspaces[workspaceKey]) {
      draft.workspaces[workspaceKey] = getPreferencesByWorkspace(
        workspaceKey,
        draft.originalWorkspaces,
      );
    }
    draft.workspace.current = workspaceKey;
  } else if (action.payload.workspaceSource === 'nmriumFile') {
    const data: any = lodashMerge(
      {},
      workspaceDefaultProperties,
      action.payload.data,
      { label: 'NMRium File', source: 'nmriumFile' },
    );
    delete data.version;
    draft.workspaces[WORKSPACES_KEYS.nmriumKey] = data;
    draft.workspace.current = WORKSPACES_KEYS.nmriumKey;
  }
}
