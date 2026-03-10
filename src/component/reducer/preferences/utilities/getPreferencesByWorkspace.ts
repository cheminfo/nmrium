import type { CustomWorkspaces } from '@zakodium/nmrium-core';
import lodashMerge from 'lodash/merge.js';

import type { NMRiumWorkspace } from '../../../main/index.js';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';
import type { WorkspaceWithSource } from '../preferencesReducer.ts';

export function getPreferencesByWorkspace(
  workspace: NMRiumWorkspace,
  originalWorkspaces: CustomWorkspaces,
): WorkspaceWithSource {
  return lodashMerge(
    { source: 'custom' as const },
    workspaceDefaultProperties,
    originalWorkspaces?.[workspace],
  );
}
