import lodashMerge from 'lodash/merge.js';
import type { WorkSpaceSource } from 'nmr-load-save';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';

export function initWorkspace(
  preferences: any,
  data: { source: WorkSpaceSource; label: string },
) {
  return lodashMerge({}, workspaceDefaultProperties, preferences, data);
}
