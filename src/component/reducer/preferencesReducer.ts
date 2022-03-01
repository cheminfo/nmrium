import { Draft, produce } from 'immer';
import lodashMerge from 'lodash/merge';

import { NMRiumMode } from '../NMRium';
import defaultPreferences from '../nmriumMode/basic';
import exercise1DPreferences from '../nmriumMode/exercise1D';
import process1DPreferences from '../nmriumMode/process1D';
import {
  getLocalStorage,
  removeData,
  storeData,
} from '../utility/LocalStorage';

export const INIT_PREFERENCES = 'INIT_PREFERENCES';
export const SET_PREFERENCES = 'SET_PREFERENCES';
export const SET_PANELS_PREFERENCES = 'SET_PANELS_PREFERENCES';

const LOCAL_STORAGE_VERSION = 2;

function getPreferencesByMode(mode: NMRiumMode) {
  switch (mode) {
    case NMRiumMode.EXERCISE_1D:
      return exercise1DPreferences;
    case NMRiumMode.PROCESS_1D:
      return process1DPreferences;
    default:
      return defaultPreferences;
  }
}

export interface PreferencesState {
  basePreferences: any;
  display: any;
  controllers: {
    mws: {
      low: number;
      high: number;
    };
    dimmedSpectraTransparency: number;
  };
  formatting: {
    nucleus: Array<{ key: string; name: string; ppm: string; hz: string }>;
    nucleusByKey: any;
    panels: any;
  };
  dispatch: any;
  mode: string;
}

export const preferencesInitialState: PreferencesState = {
  basePreferences: {},
  display: defaultPreferences.display,
  controllers: {
    mws: { low: 2, high: 20 },
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
  mode: 'default',
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
    const { dispatch, mode, ...resProps } = action.payload;
    draft.mode = mode;
    const modePreferences = getPreferencesByMode(mode);
    if (
      !localData ||
      !localData?.modes[mode] ||
      modePreferences.version !== localData?.modes[mode]?.version
    ) {
      localData = localData || {};
      localData = {
        version: LOCAL_STORAGE_VERSION,
        modes: {
          ...localData.modes,
          [mode]: {
            ...modePreferences,
            controllers: draft.controllers,
            formatting: draft.formatting,
          },
        },
      };
      storeData('nmr-general-settings', JSON.stringify(localData));
    }

    draft.basePreferences = lodashMerge({}, modePreferences, resProps);

    const hiddenModeFeatures = getTruthyObjectValues(
      draft.basePreferences.display,
    );

    let hiddenLocalStorageFeatures: any = {};

    draft.dispatch = dispatch;
    const localStorageModePreferences = localData?.modes[mode] || null;
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
      getPreferencesByMode(NMRiumMode.DEFAULT).display,
      hiddenModeFeatures,
      hiddenLocalStorageFeatures,
    );
  }
}

function handleSetPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const { controllers, formatting, display } = action.payload;

    let localData = getLocalStorage('nmr-general-settings');
    localData.modes = {
      ...localData.modes,
      [draft.mode]: {
        ...localData.modes[draft.mode],
        controllers,
        formatting,
        display,
      },
    };

    storeData('nmr-general-settings', JSON.stringify(localData));

    draft.controllers = controllers;
    draft.formatting = formatting;
    draft.display.panels = display.panels;
    draft.display.hideExperimentalFeatures = display.hideExperimentalFeatures;
    mapNucleus(draft);
  }
}
function handleSetPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const { key, value } = action.payload;
    draft.formatting.panels[key] = value;
  }
}

function innerPreferencesReducer(draft: Draft<PreferencesState>, action) {
  switch (action.type) {
    case INIT_PREFERENCES:
      return handleInit(draft, action);
    case SET_PREFERENCES:
      return handleSetPreferences(draft, action);
    case SET_PANELS_PREFERENCES:
      return handleSetPanelsPreferences(draft, action);
    default:
      return draft;
  }
}
const preferencesReducer = produce(innerPreferencesReducer);

export default preferencesReducer;
