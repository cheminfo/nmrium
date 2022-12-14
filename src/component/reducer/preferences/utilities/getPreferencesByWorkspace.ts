import lodashMerge from 'lodash/merge';

import { NMRiumWorkspace } from '../../../NMRium';
import { CustomWorkspaces } from '../../../workspaces/Workspace';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';
import { WorkspaceWithSource } from '../preferencesReducer';

export function getPreferencesByWorkspace(
  workspace: NMRiumWorkspace,
  originalWorkspaces: CustomWorkspaces,
) {
  return lodashMerge(
    {},
    workspaceDefaultProperties,
    originalWorkspaces?.[workspace],
  ) as WorkspaceWithSource;
}
