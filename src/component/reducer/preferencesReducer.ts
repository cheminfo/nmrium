import { Draft, produce } from 'immer';
import lodashMerge from 'lodash/merge';

import {
  getLocalStorage,
  removeData,
  storeData,
} from '../utility/LocalStorage';
import workspaces from '../workspaces';

export const INIT_PREFERENCES = 'INIT_PREFERENCES';
export const SET_PREFERENCES = 'SET_PREFERENCES';
export const RESET_PREFERENCES = 'RESET_PREFERENCES';
export const SET_PANELS_PREFERENCES = 'SET_PANELS_PREFERENCES';

const LOCAL_STORAGE_VERSION = 3;

function getPreferencesByWorkspace(workspace: string) {
  switch (workspace) {
    case 'exercise1D':
      return workspaces.exercise1D;
    case 'process1D':
      return workspaces.process1D;
    default:
      return workspaces.basic;
  }
}

export interface PreferencesState {
  basePreferences: any;
  display: any;
  controllers: {
    dimmedSpectraTransparency: number;
  };
  formatting: {
    nucleus: Array<{ key: string; name: string; ppm: string; hz: string }>;
    nucleusByKey: any;
    panels: any;
  };
  dispatch: any;
  workspace: string;
}

export const preferencesInitialState: PreferencesState = {
  basePreferences: {},
  display: workspaces.basic.display,
  controllers: {
    dimmedSpectraTransparency: 0.1,
  },
  formatting: {
    nucleus: [
      { key: '1H', name: '1H', ppm: '0.00', hz: '0.00' },
      { key: '13C', name: '13C', ppm: '0.00', hz: '0.00' },
      { key: '15N', name: '15N', ppm: '0.00', hz: '0.00' },
      { key: '19F', name: '19F', ppm: '0.00', hz: '0.00' },
      { key: '29Si', name: '29Si', ppm: '0.00', hz: '0.00' },
      { key: '31P', name: '31P', ppm: '0.00', hz: '0.00' },
    ],
    nucleusByKey: {},
    panels: {},
  },
  dispatch: null,
  workspace: 'default',
};

function getTruthyObjectValues(data: any) {
  return JSON.parse(JSON.stringify(data), (key, value) => {
    if (value) {
      return value;
    }
  });
}

function mapNucleus(draft: Draft<PreferencesState>) {
  if (draft.formatting.nucleus && Array.isArray(draft.formatting.nucleus)) {
    draft.formatting.nucleusByKey = draft.formatting.nucleus.reduce(
      (acc, item) => {
        acc[item.name.toLowerCase()] = item;
        return { ...acc };
      },
      {},
    );
  }
}

function handleInit(draft: Draft<PreferencesState>, action) {
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

  if (action.payload) {
    const { dispatch, workspace, ...resProps } = action.payload;
    draft.workspace = workspace;
    const workspacePreferences = getPreferencesByWorkspace(workspace);
    if (
      !localData ||
      !localData?.workspaces[workspace] ||
      workspacePreferences.version !== localData?.workspaces[workspace]?.version
    ) {
      localData = localData || {};
      localData = {
        version: LOCAL_STORAGE_VERSION,
        workspaces: {
          ...localData.workspaces,
          [workspace]: {
            ...workspacePreferences,
            controllers: draft.controllers,
            formatting: draft.formatting,
          },
        },
      };
      storeData('nmr-general-settings', JSON.stringify(localData));
    }

    draft.basePreferences = lodashMerge({}, workspacePreferences, resProps);

    const hiddenModeFeatures = getTruthyObjectValues(
      draft.basePreferences.display,
    );

    let hiddenLocalStorageFeatures: any = {};

    draft.dispatch = dispatch;
    const localStorageModePreferences =
      localData?.workspaces[workspace] || null;
    if (localStorageModePreferences) {
      Object.entries(localStorageModePreferences).forEach(([k, v]) => {
        if (k === 'display') {
          hiddenLocalStorageFeatures = getTruthyObjectValues(v);
        } else if (!['dispatch', 'basePreferences'].includes(k)) {
          draft[k] = lodashMerge({}, resProps[k] ? resProps[k] : {}, v);
        }
      });
      mapNucleus(draft);
    }
    draft.display = lodashMerge(
      {},
      getPreferencesByWorkspace('default').display,
      hiddenModeFeatures,
      hiddenLocalStorageFeatures,
    );
  }
}

function handleSetPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
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

    draft.controllers = controllers;
    draft.formatting = formatting;
    draft.display.panels = display.panels;
    draft.display.general.hideExperimentalFeatures =
      display.general.hideExperimentalFeatures;
    mapNucleus(draft);
  }
}
function handleSetPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const { key, value } = action.payload;
    let localData = getLocalStorage('nmr-general-settings');
    localData.workspaces[draft.workspace].formatting.panels[key] = value;
    storeData('nmr-general-settings', JSON.stringify(localData));
    draft.formatting.panels[key] = value;
  }
}
function handleResetPreferences(draft: Draft<PreferencesState>) {
  let localData = getLocalStorage('nmr-general-settings');
  const hiddenFeatures = getTruthyObjectValues(draft.basePreferences.display);
  const workSpaceDisplayPreferences = lodashMerge(
    {},
    getPreferencesByWorkspace(draft.workspace).display,
    hiddenFeatures,
  );
  localData.workspaces[draft.workspace].display = workSpaceDisplayPreferences;
  draft.display = workSpaceDisplayPreferences;
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
