import { produce } from 'immer';
import lodash from 'lodash';

import { getLocalStorage } from '../utility/LocalStorage';

export const INIT_PREFERENCES = 'INIT_PREFERENCES';
export const SET_PREFERENCES = 'SET_PREFERENCES';
export const SET_PANELS_PREFERENCES = 'SET_PANELS_PREFERENCES';

export const preferencesInitialState = {
  basePreferences: {},
  display: {
    general: {
      disableMultipletAnalysis: false,
      hideSetSumFromMolecule: false,
    },

    panels: {
      hideSpectraPanel: false,
      hideInformationPanel: false,
      hidePeaksPanel: false,
      hideIntegralsPanel: false,
      hideRangesPanel: false,
      hideStructuresPanel: false,
      hideFiltersPanel: false,
      hideZonesPanel: false,
      hideSummaryPanel: false,
      hideMultipleSpectraAnalysisPanel: false,
    },

    toolBarButtons: {
      hideZoomTool: false,
      hideZoomOutTool: false,
      hideImport: false,
      hideExportAs: false,
      hideSpectraStackAlignments: false,
      hideSpectraCenterAlignments: false,
      hideRealImaginary: false,
      hidePeakTool: false,
      hideIntegralTool: false,
      hideAutoRangesTool: false,
      hideZeroFillingTool: false,
      hidePhaseCorrectionTool: false,
      hideBaseLineCorrectionTool: false,
      hideFFTTool: false,
      hideMultipleSpectraAnalysisTool: false,
    },
  },
  controllers: {
    mws: { low: 2, high: 20 },
    help: {
      preventAutoHelp: true,
    },
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

const mapNucleus = (draft) => {
  draft.formatting.nucleusByKey = draft.formatting.nucleus.reduce(
    (acc, item) => {
      acc[item.name.toLowerCase()] = item;
      return { ...acc };
    },
    {},
  );
};

export function preferencesReducer(state, action) {
  switch (action.type) {
    case INIT_PREFERENCES: {
      const localData = getLocalStorage('nmr-general-settings');

      return produce(state, (draft) => {
        if (action.payload) {
          const { dispatch, ...resPreferences } = action.payload;
          draft.basePreferences = resPreferences;
          draft.display = resPreferences.display;
          draft.dispatch = dispatch;
          Object.entries(localData).forEach(([k, v]) => {
            draft[k] = lodash.merge(
              v,
              resPreferences[k] ? resPreferences[k] : {},
            );
          });
          mapNucleus(draft, state);
        }
      });
    }
    case SET_PREFERENCES:
      return produce(state, (draft) => {
        if (action.payload) {
          const data = lodash.cloneDeep(action.payload);
          draft.controllers = data.controllers;
          draft.formatting = data.formatting;
          draft.display.panels = data.display.panels;
          mapNucleus(draft, data);
        }
      });
    case SET_PANELS_PREFERENCES:
      return produce(state, (draft) => {
        if (action.payload) {
          const { key, value } = action.payload;
          draft.formatting.panels[key] = value;
        }
      });
    default:
      return state;
  }
}
