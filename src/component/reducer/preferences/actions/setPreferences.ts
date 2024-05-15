import { Draft } from 'immer';
import cloneDeep from 'lodash/cloneDeep';

import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function setPreferences(draft: Draft<PreferencesState>, action) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);

  if (action.payload) {
    const preferences = action.payload;

    draft.workspaces[draft.workspace.current] = {
      ...currentWorkspacePreferences,
      ...preferences,
    };
  }

  draft.originalWorkspaces[draft.workspace.current] = cloneDeep(
    draft.workspaces[draft.workspace.current],
  );
}
