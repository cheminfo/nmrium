import lodashMerge from 'lodash/merge.js';
import type { CustomWorkspaces, WorkspacePreferences } from 'nmrium-core';

import type { NMRiumWorkspace } from '../../../main/index.js';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';

export function getPreferencesByWorkspace(
  workspace: NMRiumWorkspace,
  originalWorkspaces: CustomWorkspaces,
): Required<WorkspacePreferences> {
  return lodashMerge(
    {},
    workspaceDefaultProperties,
    originalWorkspaces?.[workspace],
  );
}
