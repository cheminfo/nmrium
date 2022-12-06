import lodashMerge from 'lodash/merge';

import { NMRiumWorkspace } from '../../../NMRium';
import Workspaces from '../../../workspaces';
import { Workspace } from '../../../workspaces/Workspace';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';

export function getPreferencesByWorkspace(
  workspace: NMRiumWorkspace,
  customWorkspaces: Record<string, Workspace>,
) {
  const workspaces = { ...Workspaces, ...customWorkspaces };
  return lodashMerge(
    {},
    workspaceDefaultProperties,
    workspaces?.[workspace],
  ) as Workspace;
}
