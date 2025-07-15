import type { Draft } from 'immer';

import type {
  PreferencesState,
  ToggleInformationBlock,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function toggleInformationBlock(
  draft: Draft<PreferencesState>,
  action: ToggleInformationBlock,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const { visible } = action.payload || {};
  currentWorkspacePreferences.infoBlock.visible =
    visible ?? !currentWorkspacePreferences.infoBlock.visible;
}
