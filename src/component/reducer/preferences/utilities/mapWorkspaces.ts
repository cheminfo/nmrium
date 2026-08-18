import type {
  InnerWorkspace,
  WorkspacePreferences,
  WorkspaceSource,
} from '@zakodium/nmrium-core';
import lodashMerge from 'lodash/merge.js';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';

interface MapWorkspacesOptions {
  source?: WorkspaceSource;
}

export function mapWorkspaces(
  workspaces: Record<string, InnerWorkspace>,
  options: MapWorkspacesOptions = {},
) {
  const { source } = options;
  const mapObject: Record<string, Required<WorkspacePreferences>> = {};
  const sourceObject = source ? { source } : {};
  for (const key in workspaces) {
    mapObject[key] = lodashMerge(
      {},
      workspaceDefaultProperties,
      workspaces[key],
      sourceObject,
    );
  }
  return mapObject;
}
