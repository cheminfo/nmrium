import { Draft } from 'immer';

import {
  PreferencesState,
  SetVerticalSplitterPositionAction,
} from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function setVerticalSplitterPosition(
  draft: Draft<PreferencesState>,
  action: SetVerticalSplitterPositionAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  currentWorkspacePreferences.general.verticalSplitterPosition =
    action.payload.value;
}
