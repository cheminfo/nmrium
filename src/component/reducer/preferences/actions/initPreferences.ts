import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';

import { NMRiumWorkspace } from '../../../NMRium';
import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import PredefinedWorkspaces from '../../../workspaces';
import { Workspace } from '../../../workspaces/Workspace';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties';
import { PreferencesState } from '../preferencesReducer';
import { mapWorkspaces } from '../utilities/mapWorkspaces';

function getWorkspace(
  draft: Draft<PreferencesState>,
  workspace: NMRiumWorkspace,
) {
  return draft.workspaces[workspace] ? workspace : 'default';
}

export function initPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const localData = getLocalStorage('nmr-general-settings');
    const {
      dispatch,
      workspace,
      customWorkspaces: cw,
      preferences,
    } = action.payload;
    const customWorkspaces = mapWorkspaces(cw);
    const predefinedWorkspaces = mapWorkspaces(PredefinedWorkspaces as any);
    const localWorkspaces = mapWorkspaces(draft.workspaces);

    draft.customWorkspaces = customWorkspaces;

    const definedWorkplaces = { ...predefinedWorkspaces, ...customWorkspaces };
    draft.workspaces = {
      ...definedWorkplaces,
      ...localWorkspaces,
    };

    const componentWorkspacesKey =
      draft.workspacesTempKeys.componentPreferencesKey;

    /**
     *  we have the following priorities
        1- .nmrium file settings (systematic special name of workspace)
        2- preferences
        3- workspace -> if does not exists -> default workspace
        4- last selected workspace
     */

    if (preferences && componentWorkspacesKey) {
      draft.workspace = {
        current: componentWorkspacesKey,
        base: componentWorkspacesKey,
      };
    } else if (workspace) {
      const _workspace = getWorkspace(draft, workspace);
      draft.workspace = {
        current: _workspace,
        base: _workspace,
      };
    } else {
      const _workspace = getWorkspace(draft, localData.currentWorkspace);
      draft.workspace = { current: _workspace, base: null };
    }

    updateLocalStorageWorkspaces(draft, definedWorkplaces);

    if (preferences && componentWorkspacesKey) {
      const NMRiumComponentPreferences = lodashMerge(
        {},
        workspaceDefaultProperties,
        preferences,
        { label: 'NMRium Preferences' },
      ) as Workspace;

      draft.workspaces = {
        ...draft.workspaces,
        [componentWorkspacesKey]: NMRiumComponentPreferences,
      };
    }

    draft.dispatch = dispatch;
  }
}

function updateLocalStorageWorkspaces(
  draft: Draft<PreferencesState>,
  definedWorkspaces: Record<string, Workspace>,
) {
  /**
   * Update the local storage general preferences
   * 1- if local storage is empty or the setting version changed
   * 2- if predefine workspaces.
   *    a) if workspace not exists in the local storage
   *    b) if the local setting workspace version != current workspace version number
   */

  const localData = getLocalStorage('nmr-general-settings');
  const { version } = draft || {};
  let saveChanges = false;
  const data = {
    version,
    ...(localData?.currentWorkspace && {
      currentWorkspace: localData?.currentWorkspace,
    }),
  };

  //ignore the keys for component and nmrium file workspaces
  const ignoreKeys = Object.values(draft.workspacesTempKeys);

  if (!localData || version !== localData.version) {
    saveChanges = true;
  } else {
    for (const key in definedWorkspaces) {
      const workspace = definedWorkspaces[key];
      if (
        (!(key in draft.workspaces) ||
          workspace.version !== localData.workspaces[key]?.version) &&
        !ignoreKeys.includes(key)
      ) {
        saveChanges = true;
        draft.workspaces[key] = definedWorkspaces[key];
      }
    }
  }

  if (saveChanges) {
    storeData(
      'nmr-general-settings',
      JSON.stringify({ ...data, workspaces: draft.workspaces }),
    );
  }
}
