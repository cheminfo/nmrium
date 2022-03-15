import { Draft, produce, original } from 'immer';
import lodashMerge from 'lodash/merge';

import { NMRIumWorkspace } from '../NMRium';
import {
  getLocalStorage,
  removeData,
  storeData,
} from '../utility/LocalStorage';
import workspaces from '../workspaces';
import { Workspace } from '../workspaces/Workspace';

export const INIT_PREFERENCES = 'INIT_PREFERENCES';
export const SET_PREFERENCES = 'SET_PREFERENCES';
export const RESET_PREFERENCES = 'RESET_PREFERENCES';
export const SET_PANELS_PREFERENCES = 'SET_PANELS_PREFERENCES';

const LOCAL_STORAGE_VERSION = 3;

export const WORKSPACES: Array<{
  key: NMRIumWorkspace;
  label: string;
}> = [
  {
    key: 'default',
    label: workspaces.default.label,
  },
  {
    key: 'process1D',
    label: workspaces.process1D.label,
  },
  {
    key: 'exercise1D',
    label: workspaces.exercise1D.label,
  },
  {
    key: 'prediction',
    label: workspaces.prediction.label,
  },
];

function getPreferencesByWorkspace(workspace: NMRIumWorkspace) {
  switch (workspace) {
    case 'exercise1D':
      return workspaces.exercise1D;
    case 'process1D':
      return workspaces.process1D;
    case 'prediction':
      return workspaces.prediction;
    case 'default':
      return workspaces.default;
    default:
      return {} as Workspace;
  }
}

export interface PreferencesState {
  version: number;
  workspaces: Record<string, Workspace>;
  dispatch: any;
  workspace: NMRIumWorkspace;
}

function getActiveWorkspace(draft: Draft<PreferencesState>) {
  return draft.workspaces[draft.workspace || 'default'];
}

export const preferencesInitialState: PreferencesState = {
  version: LOCAL_STORAGE_VERSION,
  workspaces: {},
  dispatch: null,
  workspace: 'default',
};

function getBooleanObjectValues(data: any) {
  return JSON.parse(JSON.stringify(data), (key, value) => {
    if (value !== 'hide') {
      return value;
    }
  });
}
function FlatObject(data: any) {
  let result = {};
  JSON.parse(JSON.stringify(data), (key, value) => {
    if (value !== 'hide' && key) {
      result[key] = result[key]++ || 1;
    }
  });
  return result;
}

function checkKeysExists(sourceObject, targetObject) {
  const source = FlatObject(sourceObject);
  const target = FlatObject(targetObject);

  if (Object.keys(target).length === 0) {
    return false;
  }

  for (const [key, value] of Object.entries(source)) {
    if (!target[key] || target[key] !== value) {
      return false;
    }
  }

  return true;
}

function mapNucleus(draft: Draft<PreferencesState>) {
  const workspace = getActiveWorkspace(draft);

  if (
    workspace.formatting.nucleus &&
    Array.isArray(workspace.formatting.nucleus)
  ) {
    workspace.formatting.nucleusByKey = workspace.formatting.nucleus.reduce(
      (acc, item) => {
        acc[item.name.toLowerCase()] = item;
        return { ...acc };
      },
      {},
    );
  }
}

export function initPreferencesState(
  state: PreferencesState,
): PreferencesState {
  const nmrLocalStorageVersion = getLocalStorage(
    'nmr-local-storage-version',
    false,
  );

  let localData = getLocalStorage('nmr-general-settings');

  // remove old nmr-local-storage-version key
  if (nmrLocalStorageVersion && localData?.version) {
    removeData('nmr-local-storage-version');
  }

  if (!localData?.version || localData?.version !== LOCAL_STORAGE_VERSION) {
    removeData('nmr-general-settings');
  }

  return {
    ...state,
    version: localData?.version || LOCAL_STORAGE_VERSION,
    workspaces: localData?.workspaces || { default: workspaces.default },
  };
}

function handleInit(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const { dispatch, workspace, ...resProps } = action.payload;
    draft.workspace = workspace || 'default';
    const workspacePreferences = lodashMerge(
      {},
      getPreferencesByWorkspace(draft.workspace),
      resProps,
    );
    const activeWorkspace = getActiveWorkspace(draft);

    const localData = getLocalStorage('nmr-general-settings');

    if (
      LOCAL_STORAGE_VERSION !== draft.version ||
      !activeWorkspace ||
      workspacePreferences?.version !== activeWorkspace?.version ||
      !checkKeysExists(
        workspacePreferences.display,
        activeWorkspace?.display,
      ) ||
      !localData
    ) {
      const { workspaces, version } = original(draft) || {};
      const display = getBooleanObjectValues(workspacePreferences.display);

      const data = {
        version,
        workspaces: {
          ...workspaces,
          [draft.workspace]: {
            ...workspacePreferences,
            display,
          },
        },
      };
      draft.workspaces[draft.workspace] = lodashMerge(
        {},
        activeWorkspace,
        workspacePreferences,
      );
      storeData('nmr-general-settings', JSON.stringify(data));
    } else {
      activeWorkspace.display = lodashMerge(
        {},
        workspacePreferences.display,
        activeWorkspace.display,
      );
    }

    draft.dispatch = dispatch;
  }
}

function handleSetPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const workspace = getActiveWorkspace(draft);

    const { controllers, formatting, display } = action.payload;

    let localData = getLocalStorage('nmr-general-settings');
    localData.workspaces = {
      ...localData.workspaces,
      [draft.workspace]: {
        ...localData.workspaces[draft.workspace],
        controllers,
        formatting,
        display,
      },
    };

    storeData('nmr-general-settings', JSON.stringify(localData));

    workspace.controllers = controllers;
    workspace.formatting = formatting;
    workspace.display = {
      ...workspace.display,
      panels: display.panels,
      general: {
        ...(workspace.display.general || {}),
        experimentalFeatures: display.general.experimentalFeatures,
      },
    };
    mapNucleus(draft);
  }
}
function handleSetPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const workspace = getActiveWorkspace(draft);

    const { key, value } = action.payload;
    let localData = getLocalStorage('nmr-general-settings');
    localData.workspaces[draft.workspace].formatting.panels[key] = value;
    storeData('nmr-general-settings', JSON.stringify(localData));
    workspace.formatting.panels[key] = value;
  }
}
function handleResetPreferences(draft: Draft<PreferencesState>) {
  const workspace = getActiveWorkspace(draft);
  let localData = getLocalStorage('nmr-general-settings');
  // const hiddenFeatures = getTruthyObjectValues(draft.basePreferences.display);
  const workSpaceDisplayPreferences = getPreferencesByWorkspace(
    draft.workspace,
  ).display;
  localData.workspaces[draft.workspace].display = workSpaceDisplayPreferences;
  workspace.display = workSpaceDisplayPreferences;
  storeData('nmr-general-settings', JSON.stringify(localData));
}

function innerPreferencesReducer(draft: Draft<PreferencesState>, action) {
  switch (action.type) {
    case INIT_PREFERENCES:
      return handleInit(draft, action);
    case SET_PREFERENCES:
      return handleSetPreferences(draft, action);
    case SET_PANELS_PREFERENCES:
      return handleSetPanelsPreferences(draft, action);
    case RESET_PREFERENCES:
      return handleResetPreferences(draft);
    default:
      return draft;
  }
}
const preferencesReducer = produce(innerPreferencesReducer);

export default preferencesReducer;
