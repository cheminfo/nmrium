import type { WorkSpaceSource } from '@zakodium/nmrium-core';
import lodashMerge from 'lodash/merge.js';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';

export function initWorkspace(
  preferences: any,
  data: { source: WorkSpaceSource; label: string },
) {
  return lodashMerge({}, workspaceDefaultProperties, preferences, data);
}
