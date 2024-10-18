import type { Draft } from 'immer';

import type {
  ChangePeaksLabelPositionAction,
  PreferencesState,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function changePeaksLabelPosition(
  draft: Draft<PreferencesState>,
  action: ChangePeaksLabelPositionAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  currentWorkspacePreferences.peaksLabel.marginTop = action.payload.marginTop;
}
