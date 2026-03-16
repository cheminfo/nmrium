import type { CustomWorkspaces } from '@zakodium/nmrium-core';
import lodashMergeWith from 'lodash/mergeWith.js';

import type { NMRiumWorkspace } from '../../../main/index.js';
import { mergeReplaceArray } from '../../../utility/merge_replace_array.ts';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.js';
import type { WorkspaceWithSource } from '../preferencesReducer.ts';

export function getPreferencesByWorkspace(
  workspace: NMRiumWorkspace,
  originalWorkspaces: CustomWorkspaces,
): WorkspaceWithSource {
  return lodashMergeWith(
    { source: 'custom' as const },
    workspaceDefaultProperties,
    originalWorkspaces?.[workspace],
    mergeReplaceArray,
  );
}
