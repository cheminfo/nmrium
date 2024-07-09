import { Draft } from 'immer';

import {
  ToggleInformationBlock,
  PreferencesState,
} from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function toggleInformationBlock(
  draft: Draft<PreferencesState>,
  action: ToggleInformationBlock,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const { visible } = action.payload || {};
  currentWorkspacePreferences.infoBlock.visible =
    visible ?? !currentWorkspacePreferences.infoBlock.visible;
}
