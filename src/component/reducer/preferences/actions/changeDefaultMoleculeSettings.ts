import type { Draft } from 'immer';

import type {
  ChangeDefaultMoleculeSettingsAction,
  PreferencesState,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function changeDefaultMoleculeSettings(
  draft: Draft<PreferencesState>,
  action: ChangeDefaultMoleculeSettingsAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const settings = action.payload;
  currentWorkspacePreferences.defaultMoleculeSettings = settings;
}
