import { Draft } from 'immer';

import {
  ChangePeaksLabelPositionAction,
  PreferencesState,
} from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function changePeaksLabelPosition(
  draft: Draft<PreferencesState>,
  action: ChangePeaksLabelPositionAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  currentWorkspacePreferences.peaksLabel.marginTop = action.payload.marginTop;
}
