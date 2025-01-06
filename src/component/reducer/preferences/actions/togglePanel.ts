import type { Draft } from 'immer';
import type { PanelPreferencesType } from 'nmr-load-save';

import type {
  PreferencesState,
  TogglePanelAction,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function togglePanel(
  draft: Draft<PreferencesState>,
  action: TogglePanelAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const { id } = action.payload || {};

  const panel: PanelPreferencesType =
    currentWorkspacePreferences.display.panels?.[id];
  if (panel) {
    panel.display = !panel.display;
  }
}
