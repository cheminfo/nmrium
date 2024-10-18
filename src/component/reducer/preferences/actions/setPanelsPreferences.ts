import type { Draft } from 'immer';

import type { PreferencesState } from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function setPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    const { key, value } = action.payload;
    const panels = currentWorkspacePreferences.panels;

    if (value?.nuclei) {
      const { nuclei, ...commonPreferences } = value;
      panels[key] = {
        ...commonPreferences,
        nuclei: { ...panels[key]?.nuclei, ...nuclei },
      };
    } else {
      panels[key] = value;
    }
  }
}
