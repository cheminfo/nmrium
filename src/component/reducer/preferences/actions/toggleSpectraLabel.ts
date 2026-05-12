import type { Draft } from 'immer';

import { getBaseSpectraPreferences } from '../panelsPreferencesDefaultValues.ts';
import type {
  PreferencesState,
  ToggleSpectraLabelAction,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function toggleSpectraLabel(
  draft: Draft<PreferencesState>,
  action: ToggleSpectraLabelAction,
) {
  const { panels } = getActiveWorkspace(draft);

  const { nucleus } = action.payload;

  panels.spectra ??= { nuclei: {} };
  const { nuclei } = panels.spectra;

  if (!nuclei[nucleus]) {
    const defaultValues = getBaseSpectraPreferences();
    nuclei[nucleus] = {
      ...defaultValues,
      enableSpectraLabel: !defaultValues.enableSpectraLabel,
    };
    return;
  }

  nuclei[nucleus].enableSpectraLabel = !nuclei[nucleus].enableSpectraLabel;
}
