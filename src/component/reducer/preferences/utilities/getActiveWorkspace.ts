import type { Workspace } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

import type { PreferencesState } from '../preferencesReducer.js';

export function getActiveWorkspace(draft: Draft<PreferencesState>) {
  return draft.workspaces[
    draft.workspace.current || 'default'
  ] as Required<Workspace>;
}
