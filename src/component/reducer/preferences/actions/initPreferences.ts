import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import PredefinedWorkspaces from '../../../workspaces';
import { PreferencesState } from '../preferencesReducer';
import { checkKeysExists } from '../utilities/checkKeysExists';
import { filterObject } from '../utilities/filterObject';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';
import { mapWorkspaces } from '../utilities/mapWorkspaces';

export function initPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const localData = getLocalStorage('nmr-general-settings');
    const {
      dispatch,
      workspace,
      customWorkspaces: cw,
      ...resProps
    } = action.payload;
    const customWorkspaces = mapWorkspaces(cw);
    const predefinedWorkspaces = mapWorkspaces(PredefinedWorkspaces as any);
    const localWorkspaces = mapWorkspaces(draft.workspaces);

    draft.customWorkspaces = customWorkspaces;
    draft.workspaces = {
      ...predefinedWorkspaces,
      ...localWorkspaces,
      ...customWorkspaces,
    };

    /**
     * set the current workspace what the user-defined in the setting if the workspace is not defined at the level of component, otherwise
     * use the default workspace
     *
     */

    if (!workspace && localData?.currentWorkspace) {
      draft.workspace = { current: localData.currentWorkspace, base: null };
    } else {
      const _workspace = draft.workspaces[workspace] ? workspace : 'default';
      draft.workspace = {
        current: _workspace,
        base: _workspace,
      };
    }

    const workspacePreferences = lodashMerge(
      {},
      draft.workspaces[draft.workspace.current],
      resProps.display,
    );

    const currentWorkspacePreferences = getActiveWorkspace(draft);

    /**
     * Update the local storage general preferences
     * 1- if local storage is empty.
     * 2- if predefine workspaces.
     * 3- b) if workspace not exists in the local storage
     *    c) if the local setting workspace version != current workspace version number
     *    d) if hard code workspace parameters !=  current workspace parameters
     */
    if (
      (PredefinedWorkspaces[draft.workspace.current] &&
        (!currentWorkspacePreferences ||
          workspacePreferences?.version !==
            currentWorkspacePreferences?.version ||
          !checkKeysExists(
            workspacePreferences.display,
            currentWorkspacePreferences?.display,
          ))) ||
      !localData
    ) {
      const {
        workspaces,
        version,
        workspace: { current },
        customWorkspaces,
      } = draft || {};
      const display = filterObject(workspacePreferences.display);

      const data = {
        version,
        ...(localData?.currentWorkspace && {
          currentWorkspace: localData?.currentWorkspace,
        }),
        workspaces: {
          ...mapWorkspaces(workspaces, {
            ignoreKeys: customWorkspaces,
            mergeWithDefaultProperties: false,
          }),
          ...(!customWorkspaces[current]
            ? {
                [current]: {
                  ...workspacePreferences,
                  display,
                },
              }
            : {}),
        },
      };

      draft.workspaces[current] = lodashMerge(
        {},
        currentWorkspacePreferences,
        workspacePreferences,
      );
      storeData('nmr-general-settings', JSON.stringify(data));
    } else {
      draft.workspaces[draft.workspace.current] = lodashMerge(
        {},
        currentWorkspacePreferences,
        resProps,
      );
    }

    draft.dispatch = dispatch;
  }
}
