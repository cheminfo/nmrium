import lodashMerge from 'lodash/merge';

import { Workspace, WorkSpaceSource } from '../../../workspaces/Workspace';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';

export function mapWorkspaces(
  customWorkspaces: Record<string, Workspace>,
  source: WorkSpaceSource,
) {
  const mapObject = {};
  const prefix = source === 'custom' ? 'custom-' : '';
  for (const key in customWorkspaces) {
    mapObject[`${prefix}${key}`] = lodashMerge(
      {},
      workspaceDefaultProperties,
      customWorkspaces[key],
    );
  }
  return mapObject;
}
