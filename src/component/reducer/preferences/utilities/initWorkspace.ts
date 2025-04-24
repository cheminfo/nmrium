import lodashMerge from 'lodash/merge.js';
import type { WorkSpaceSource } from 'nmrium-core';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';

export function initWorkspace(
  preferences: any,
  data: { source: WorkSpaceSource; label: string },
) {
  return lodashMerge({}, workspaceDefaultProperties, preferences, data);
}
