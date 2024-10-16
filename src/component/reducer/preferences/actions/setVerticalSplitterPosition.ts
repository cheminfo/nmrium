import { Draft } from 'immer';

import {
  PreferencesState,
  SetVerticalSplitterPositionAction,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function setVerticalSplitterPosition(
  draft: Draft<PreferencesState>,
  action: SetVerticalSplitterPositionAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  currentWorkspacePreferences.general.verticalSplitterPosition =
    action.payload.value;
}
