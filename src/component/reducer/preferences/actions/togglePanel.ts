import type { PanelPreferencesType } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

import type {
  PreferencesState,
  TogglePanelAction,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

const emptyPanel: Partial<PanelPreferencesType> = {};

export function togglePanel(
  draft: Draft<PreferencesState>,
  action: TogglePanelAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const { id, options } = action.payload;

  const panels = currentWorkspacePreferences.display.panels;
  const existingPanel = panels?.[id] || { ...emptyPanel };

  for (const entry of Object.entries(options)) {
    const [key, value] = entry as [
      keyof PanelPreferencesType,
      boolean | undefined,
    ];
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
