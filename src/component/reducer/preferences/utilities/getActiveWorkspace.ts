import { Draft } from 'immer';
import { Workspace } from 'nmr-load-save';

import { PreferencesState } from '../preferencesReducer.js';

export function getActiveWorkspace(draft: Draft<PreferencesState>) {
  return draft.workspaces[
    draft.workspace.current || 'default'
  ] as Required<Workspace>;
}
