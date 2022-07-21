import { Draft } from 'immer';
import lodashMerge from 'lodash/merge';

import { getLocalStorage, storeData } from '../../../utility/LocalStorage';
import Workspaces from '../../../workspaces';
import { PreferencesState } from '../preferencesReducer';
import { checkKeysExists } from '../utilites/checkKeysExists';
import { filterObject } from '../utilites/filterObject';
import { getActiveWorkspace } from '../utilites/getActiveWorkspace';
import { getPreferencesByWorkspace } from '../utilites/getPreferencesByWorkspace';

export function initPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const localData = getLocalStorage('nmr-general-settings');

    const { dispatch, workspace, ...resProps } = action.payload;
    /**
     * set the current workspace what the user-defined in the setting if the workspace is not defined at the level of component, otherwise
     * use the default workspace
     *
     */
    draft.workspace =
      !workspace && localData?.currentWorkspace
        ? { current: localData.currentWorkspace, base: null }
        : { current: workspace || 'default', base: workspace };

    const workspacePreferences = lodashMerge(
      {},
      getPreferencesByWorkspace(draft.workspace.current),
      resProps,
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
      (Workspaces[draft.workspace.current] &&
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
      } = draft || {};
      const display = filterObject(workspacePreferences.display);

      const data = {
        version,
        ...(localData?.currentWorkspace && {
          currentWorkspace: localData?.currentWorkspace,
        }),
        workspaces: {
          ...workspaces,
          [current]: {
            ...workspacePreferences,
            display,
          },
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
