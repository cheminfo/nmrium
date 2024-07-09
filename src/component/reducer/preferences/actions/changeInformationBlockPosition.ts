import { Draft } from 'immer';

import {
  ChangeInformationBlockPosition,
  PreferencesState,
} from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function changeInformationBlockPosition(
  draft: Draft<PreferencesState>,
  action: ChangeInformationBlockPosition,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  currentWorkspacePreferences.infoBlock.position = action.payload.coordination;
}
