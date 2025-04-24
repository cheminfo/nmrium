import type { Draft } from 'immer';
import type { PanelPreferencesType } from 'nmrium-core';

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

  if (!id) return;

  const panels = currentWorkspacePreferences.display.panels || {};

  const existingPanel: PanelPreferencesType = panels[id];

  currentWorkspacePreferences.display.panels = {
    ...panels,
    [id]: {
      ...existingPanel,
      display: existingPanel ? !existingPanel.display : true,
    },
  };
}
