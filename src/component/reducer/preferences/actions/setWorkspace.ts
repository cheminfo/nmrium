import { Draft } from 'immer';

import { NMRiumWorkspace } from '../../../NMRium';
import { PreferencesState, WorkspaceAction } from '../preferencesReducer';
import { getPreferencesByWorkspace } from '../utilities/getPreferencesByWorkspace';

export function setWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  const workspaceKey = action.payload.workspace;
  if (!draft.workspaces[workspaceKey]) {
    draft.workspaces[workspaceKey] = getPreferencesByWorkspace(
      workspaceKey as NMRiumWorkspace,
    );
  }
  draft.workspace.current = workspaceKey as NMRiumWorkspace;
}
