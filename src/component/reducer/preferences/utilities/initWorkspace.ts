import lodashMerge from 'lodash/merge';

import { WorkSpaceSource } from '../../../workspaces/Workspace';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';

export function initWorkspace(
  preferences: any,
  data: { source: WorkSpaceSource; label: string },
) {
  return lodashMerge({}, workspaceDefaultProperties, preferences, data);
}
