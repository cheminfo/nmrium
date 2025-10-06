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
  const { options, nucleus } = action.payload;
  const workspace = getActiveWorkspace(draft);
  workspace.acsExportSettings = {
    ...workspace.acsExportSettings,
    [nucleus]: options,
  };
}
