import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';
import { PreferencesState, SetWorkspaceAction } from '../preferencesReducer';
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
        draft.customWorkspaces,
      );
    }
    draft.workspace.current = workspaceKey;
  } else if (action.payload.workspaceSource === 'nmriumFile') {
    const data: any = lodashMerge(
      {},
      workspaceDefaultProperties,
      action.payload.data,
      { label: 'NMRium File' },
    );
    delete data.version;
    draft.workspaces[draft.workspacesTempKeys.nmriumWorkspaceKey] = data;
    draft.workspace.current = draft.workspacesTempKeys.nmriumWorkspaceKey;
  }
}
