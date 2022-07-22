import { Draft } from 'immer';

import { Workspace } from '../../../workspaces/Workspace';
import { PreferencesState } from '../preferencesReducer';

export function getActiveWorkspace(draft: Draft<PreferencesState>) {
  return draft.workspaces[
    draft.workspace.current || 'default'
  ] as Required<Workspace>;
}
