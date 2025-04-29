import type { Workspace, WorkSpaceSource } from '@zakodium/nmrium-core';
import lodashMerge from 'lodash/merge.js';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';

interface MapWorkspacesOptions {
  ignoreKeys?: object;
  mergeWithDefaultProperties?: boolean;
  source?: WorkSpaceSource;
}

export function mapWorkspaces(
  workspaces: Record<string, Workspace>,
  options: MapWorkspacesOptions = {},
) {
  const {
    mergeWithDefaultProperties = true,
    ignoreKeys = {},
    source,
  } = options;
  const mapObject = {};
  const sourceObject = source ? { source } : {};
  for (const key in workspaces) {
    if (!(key in ignoreKeys)) {
      if (mergeWithDefaultProperties) {
        mapObject[key] = lodashMerge(
          {},
          workspaceDefaultProperties,
          workspaces[key],
          sourceObject,
        );
      } else {
        mapObject[key] = { ...workspaces[key], ...sourceObject };
      }
    }
  }
  return mapObject;
}
