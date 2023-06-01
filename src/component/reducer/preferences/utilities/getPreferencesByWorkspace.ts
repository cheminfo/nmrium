import lodashMerge from 'lodash/merge';
import { CustomWorkspaces } from 'nmr-load-save';

import { NMRiumWorkspace } from '../../../NMRium';
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
