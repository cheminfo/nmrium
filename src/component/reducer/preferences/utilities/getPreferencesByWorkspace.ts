import lodashMerge from 'lodash/merge';
import { CustomWorkspaces, WorkspacePreferences } from 'nmr-load-save';

import type { NMRiumWorkspace } from '../../../main';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';

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
