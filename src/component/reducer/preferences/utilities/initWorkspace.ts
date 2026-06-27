import type { WorkspaceSource } from '@zakodium/nmrium-core';
import lodashMerge from 'lodash/merge.js';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';
import type { WorkspaceWithSource } from '../preferencesReducer.js';

export function initWorkspace(
  preferences: any,
  data: { source: WorkspaceSource; label: string },
): WorkspaceWithSource {
  return lodashMerge({}, workspaceDefaultProperties, preferences, data);
}
