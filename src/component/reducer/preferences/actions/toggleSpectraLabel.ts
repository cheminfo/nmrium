import type { Draft } from 'immer';

import type {
  PreferencesState,
  ToggleSpectraLabelAction,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function toggleSpectraLabel(
  draft: Draft<PreferencesState>,
  action: ToggleSpectraLabelAction,
) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    const { nucleus } = action.payload;
    const nucleusPreferences =
      currentWorkspacePreferences.panels.spectra?.nuclei[nucleus];

    if (!nucleusPreferences) {
      return;
    }

    nucleusPreferences.enableSpectraLabel =
      !nucleusPreferences.enableSpectraLabel;
  }
}
