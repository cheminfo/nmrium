import { Draft } from 'immer';

import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function setPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    const { key, value } = action.payload;
    const panels = currentWorkspacePreferences.formatting.panels;

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
