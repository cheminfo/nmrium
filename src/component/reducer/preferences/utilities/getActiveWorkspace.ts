import type { Draft } from 'immer';
import type { Workspace } from 'nmr-load-save';

import type { PreferencesState } from '../preferencesReducer.js';

export function getActiveWorkspace(draft: Draft<PreferencesState>) {
  return draft.workspaces[
    draft.workspace.current || 'default'
  ] as Required<Workspace>;
}
