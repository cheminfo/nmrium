import { Draft } from 'immer';

import {
  PreferencesState,
  SetWorkspaceAction,
  WORKSPACES_KEYS,
} from '../preferencesReducer';
import { getPreferencesByWorkspace } from '../utilities/getPreferencesByWorkspace';
import { initWorkspace } from '../utilities/initWorkspace';

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
    const workspaceData = { label: 'NMRium File', source: 'nmriumFile' };
    const workspaceKey = WORKSPACES_KEYS.nmriumKey;
    draft.workspaces[workspaceKey] = initWorkspace(
      action.payload.data,
      workspaceData as any,
    );
    draft.originalWorkspaces[workspaceKey] = initWorkspace(
      action.payload.data,
      workspaceData as any,
    );

    draft.workspace = { current: workspaceKey, base: workspaceKey };
  }
}
