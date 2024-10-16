import type { Draft } from 'immer';

import type {
  ChangeInformationBlockPosition,
  PreferencesState,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function changeInformationBlockPosition(
  draft: Draft<PreferencesState>,
  action: ChangeInformationBlockPosition,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  currentWorkspacePreferences.infoBlock.position = action.payload.coordination;
}
