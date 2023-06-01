import lodashMerge from 'lodash/merge';
import { WorkSpaceSource } from 'nmr-load-save';

import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';

export function initWorkspace(
  preferences: any,
  data: { source: WorkSpaceSource; label: string },
) {
  return lodashMerge({}, workspaceDefaultProperties, preferences, data);
}
