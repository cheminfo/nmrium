import type { Draft } from 'immer';

import type {
  PreferencesState,
  ChangePrintPageSettingsAction,
} from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

export function changePrintPageSettings(
  draft: Draft<PreferencesState>,
  action: ChangePrintPageSettingsAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const pageSettings = action.payload || {};
  currentWorkspacePreferences.printPageOptions = pageSettings;
}
