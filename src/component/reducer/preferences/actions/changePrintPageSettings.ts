import { Draft } from 'immer';

import {
  PreferencesState,
  ChangePrintPageSettingsAction,
} from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function changePrintPageSettings(
  draft: Draft<PreferencesState>,
  action: ChangePrintPageSettingsAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const pageSettings = action.payload || {};
  currentWorkspacePreferences.printPageOptions = pageSettings;
}
