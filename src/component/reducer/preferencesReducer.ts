import { Draft, produce } from 'immer';
import lodashMerge from 'lodash/merge';

import { NMRiumMode } from '../NMRium';
import basic from '../nmriumMode/basic';
import exercise1D from '../nmriumMode/exercise1D';
import process1D from '../nmriumMode/process1D';
import {
  getLocalStorage,
  removeData,
  storeData,
} from '../utility/LocalStorage';

export const INIT_PREFERENCES = 'INIT_PREFERENCES';
export const SET_PREFERENCES = 'SET_PREFERENCES';
export const SET_PANELS_PREFERENCES = 'SET_PANELS_PREFERENCES';

const LOCAL_STORGAE_VERSION = '1.1';

function getPreferencesByMode(mode: NMRiumMode) {
  switch (mode) {
    case NMRiumMode.EXERCISE_1D:
      return exercise1D;
    case NMRiumMode.PROCESS_1D:
      return process1D;
    default:
      return basic;
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
    help: {
      preventAutoHelp: boolean;
    };
    dimmedSpectraTransparency: number;
  };
  formatting: {
    nucleus: Array<{ key: string; name: string; ppm: string; hz: string }>;
    nucleusByKey: any;
    panels: any;
  };
  dispatch: any;
}

export const preferencesInitialState: PreferencesState = {
  basePreferences: {},
  display: basic,
  controllers: {
    mws: { low: 2, high: 20 },
    help: {
      preventAutoHelp: true,
    },
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
};

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
  if (
    !nmrLocalStorageVersion ||
    nmrLocalStorageVersion !== LOCAL_STORGAE_VERSION
  ) {
    removeData('nmr-general-settings');
    storeData('nmr-local-storage-version', LOCAL_STORGAE_VERSION);
  }

  const localData = getLocalStorage('nmr-general-settings');

  if (action.payload) {
    const { dispatch, mode, ...resProps } = action.payload;

    draft.basePreferences = lodashMerge(
      {},
      {
        display: mode === NMRiumMode.DEFAULT ? {} : getPreferencesByMode(mode),
      },
      resProps,
    );

    const hiddenFeatures = JSON.parse(
      JSON.stringify(draft.basePreferences.display),
      (key, value) => {
        if (value) {
          return value;
        }
      },
    );

    draft.display = lodashMerge(
      {},
      getPreferencesByMode(NMRiumMode.DEFAULT),
      hiddenFeatures,
    );
    draft.dispatch = dispatch;
    if (localData) {
      Object.entries(localData).forEach(([k, v]) => {
        if (!['dispatch', 'basePreferences'].includes(k)) {
          draft[k] = lodashMerge({}, resProps[k] ? resProps[k] : {}, v);
        }
      });
      mapNucleus(draft);
    }
  }
}

function handleSetPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const data = action.payload;
    draft.controllers = data.controllers;
    draft.formatting = data.formatting;
    draft.display.panels = data.display.panels;
    draft.display.hideExperimentalFeatures =
      data.display.hideExperimentalFeatures;
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
      return handleSetPanelsPreferences;
    default:
      return draft;
  }
}
const preferencesReducer = produce(innerPreferencesReducer);

export default preferencesReducer;
