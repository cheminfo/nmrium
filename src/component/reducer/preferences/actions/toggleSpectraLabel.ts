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
  const { value } = action.payload;
  const currentWorkspace = getActiveWorkspace(draft);
  if (!currentWorkspace) return;

  currentWorkspace.spectraLabel.visible =
    value ?? !currentWorkspace.spectraLabel.visible;
}
