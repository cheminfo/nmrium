import lodashMerge from 'lodash/merge';

import { Workspace } from '../../../workspaces/Workspace';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';

interface MapWorkspacesOptions {
  ignoreKeys?: object;
  mergeWithDefaultProperties?: boolean;
}

export function mapWorkspaces(
  workspaces: Record<string, Workspace>,
  options: MapWorkspacesOptions = {},
) {
  const { mergeWithDefaultProperties = true, ignoreKeys = {} } = options;
  const mapObject = {};
  for (const key in workspaces) {
    if (!(key in ignoreKeys)) {
      if (mergeWithDefaultProperties) {
        mapObject[key] = lodashMerge(
          {},
          workspaceDefaultProperties,
          workspaces[key],
        );
      } else {
        mapObject[key] = workspaces[key];
      }
    }
  }
  return mapObject;
}
