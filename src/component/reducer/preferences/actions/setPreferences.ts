import type { Draft } from 'immer';
import { original } from 'immer';
import cloneDeep from 'lodash/cloneDeep.js';

import type {
  PreferencesState,
  SetPreferencesAction,
  WorkspaceWithSource,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function setPreferences(
  draft: Draft<PreferencesState>,
  action: SetPreferencesAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);

  if ('payload' in action) {
    const preferences = action.payload;

    draft.workspaces[draft.workspace.current] = {
      ...currentWorkspacePreferences,
      ...preferences,
    } as WorkspaceWithSource;
  }

  draft.originalWorkspaces[draft.workspace.current] = cloneDeep(
    original(draft.workspaces[draft.workspace.current]),
  );
}
