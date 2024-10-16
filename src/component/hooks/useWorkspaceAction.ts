import { v4 } from '@lukeed/uuid';
import lodashMerge from 'lodash/merge.js';
import { Workspace } from 'nmr-load-save';

import { usePreferences } from '../context/PreferencesContext.js';
import {
  Settings,
  readSettings,
  updateSettings,
} from '../reducer/preferences/preferencesReducer.js';
import { workspaceDefaultProperties } from '../workspaces/workspaceDefaultProperties.js';

export function useWorkspaceAction() {
  const { dispatch, current, workspace } = usePreferences();

  function setActiveWorkspace(workspace: string) {
    const settings = readSettings() || {
      currentWorkspace: null,
      version: 0,
      workspaces: {},
    };
    settings.currentWorkspace = workspace;
    updateSettings(settings);

    dispatch({
      type: 'SET_ACTIVE_WORKSPACE',
      payload: {
        workspace,
      },
    });
  }

  function addNewWorkspace(
    workspaceName: string,
    data?: Omit<Workspace, 'version' | 'label'>,
  ) {
    const workSpaceData = data ?? current;
    const newWorkSpace = lodashMerge(
      {},
      workspaceDefaultProperties,
      workSpaceData,
      {
        version: 1,
        label: workspaceName,
        source: 'user',
      },
    );
    const workspaceKey = v4();
    const localData = readSettings() || { workspaces: {} };
    const settings = {
      ...localData,
      currentWorkspace: workspaceKey,
      workspaces: { ...localData?.workspaces, [workspaceKey]: newWorkSpace },
    };
    updateSettings(settings as Settings);

    dispatch({
      type: 'ADD_WORKSPACE',
      payload: {
        workspaceKey,
        data: newWorkSpace,
      },
    });
  }

  function removeWorkspace(key: string) {
    const settings = readSettings();
    if (settings) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete settings.workspaces[key];
      if (key === settings.currentWorkspace) {
        settings.currentWorkspace = 'default';
      }

      updateSettings(settings);
    }
    dispatch({
      type: 'REMOVE_WORKSPACE',
      payload: {
        workspace: key,
      },
    });
  }

  function saveWorkspace(data?: Partial<Workspace>) {
    const settings = readSettings() || {
      version: 0,
      currentWorkspace: null,
      workspaces: {},
    };
    updateSettings({
      ...settings,
      workspaces: {
        ...settings.workspaces,
        [workspace.current]: data ?? current,
      },
    } as Settings);

    dispatch({
      type: 'SET_PREFERENCES',
      ...(data && { payload: data }),
    });
  }

  return {
    addNewWorkspace,
    removeWorkspace,
    saveWorkspace,
    setActiveWorkspace,
  };
}
