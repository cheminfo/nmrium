import type { PanelPreferencesType } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

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
  const { id, options } = action.payload || {};

  if (!id) return;

  const panels = currentWorkspacePreferences.display.panels || {};

  const existingPanel: PanelPreferencesType = { ...panels[id] };

  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) {
      existingPanel[key] = !existingPanel[key];
    } else {
      existingPanel[key] = value;
    }
  }
  currentWorkspacePreferences.display.panels = {
    ...panels,
    [id]: existingPanel,
  };
}
