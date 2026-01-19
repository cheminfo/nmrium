import type { Draft } from 'immer';

import type {
  PreferencesState,
  ToggleSplitPanelAction,
} from '../preferencesReducer.ts';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.ts';

export function toggleOpenSplitPanel(
  draft: Draft<PreferencesState>,
  action: ToggleSplitPanelAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const { isOpen } = action.payload || {};
  const generalPreferences = currentWorkspacePreferences.display.general || {};
  generalPreferences.hidePanelOnLoad =
    isOpen ?? !generalPreferences.hidePanelOnLoad;
}
