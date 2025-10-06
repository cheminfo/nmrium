import type { Draft } from 'immer';

import type {
  ChangeExportACSSettingsAction,
  PreferencesState,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function changeExportAcsSettings(
  draft: Draft<PreferencesState>,
  action: ChangeExportACSSettingsAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const { options } = action.payload;
  currentWorkspacePreferences.acsExportOptions = options;
}
