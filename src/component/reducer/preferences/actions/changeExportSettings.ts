import { Draft } from 'immer';

import {
  PreferencesState,
  ChangeExportSettingsAction,
} from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

export function changeExportSettings(
  draft: Draft<PreferencesState>,
  action: ChangeExportSettingsAction,
) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const { key, options } = action.payload;
  currentWorkspacePreferences.export[key] = options;
}
