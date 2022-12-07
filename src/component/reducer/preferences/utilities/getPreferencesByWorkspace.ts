import lodashMerge from 'lodash/merge';

import { NMRiumWorkspace } from '../../../NMRium';
import predefinedWorkspaces from '../../../workspaces';
import { CustomWorkspaces, Workspace } from '../../../workspaces/Workspace';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';

export function getPreferencesByWorkspace(
  workspace: NMRiumWorkspace,
  customWorkspaces: CustomWorkspaces,
) {
  const workspaces = { ...predefinedWorkspaces, ...customWorkspaces };
  return lodashMerge(
    {},
    workspaceDefaultProperties,
    workspaces?.[workspace],
  ) as Workspace;
}
