import { Draft } from 'immer';
import { buildCorrelationData, CorrelationData } from 'nmr-correlation';

import { addJcamps } from '../../../data/SpectraManager';
import { initiateDatum1D } from '../../../data/data1d/Spectrum1D';
import { initiateDatum2D } from '../../../data/data2d/Spectrum2D';
import { StateMoleculeExtended } from '../../../data/molecules/Molecule';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { UsedColors } from '../../../types/UsedColors';
import { Spectra } from '../../NMRium';
import { DefaultTolerance } from '../../panels/SummaryPanel/CorrelationTable/Constants';
import { getInitialState, State, ViewState } from '../Reducer';

import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { setActiveTab } from './ToolsActions';

function setIsLoading(draft: Draft<State>, isLoading: boolean) {
  draft.isLoading = isLoading;
}

function setColors(draft: Draft<State>, colors: UsedColors) {
  draft.usedColors['1d'] = draft.usedColors['1d'].concat(colors['1d']);
  draft.usedColors['2d'] = draft.usedColors['2d'].concat(colors['2d']);
}

function setCorrelation(draft: Draft<State>, correlations) {
  if (!correlations || Object.keys(correlations).length === 0) {
    draft.correlations = buildCorrelationData([], {
      tolerance: DefaultTolerance,
    });
  } else {
    // in case of older NMRium data are imported, convert hybridization string to number array
    // @TODO remove following command to overwrite correlations at some point in future
    draft.correlations =
      convertHybridizationStringValuesInCorrelations(correlations);

    // draft.correlations = correlations // original command without overwriting
  }
}

function initSpectra(inputSpectra: (Datum1D | Datum2D)[], usedColors) {
  const spectra: any = [];

  for (const spectrum of inputSpectra) {
    const { info } = spectrum;
    if (info.dimension === 1) {
      spectra.push(initiateDatum1D(spectrum, usedColors));
    } else if (info.dimension === 2) {
      spectra.push(initiateDatum2D({ ...spectrum }, usedColors));
    }
  }
  return spectra;
}

function setData(
  draft: Draft<State>,
  input: {
    view?: ViewState;
    data: {
      spectra: Spectra;
      molecules: StateMoleculeExtended[];
      correlations: CorrelationData;
    };
    usedColors: UsedColors;
  },
) {
  const {
    data: { spectra, molecules, correlations },
    usedColors,
    view,
  } = input || {
    data: { spectra: [], molecules: [], correlations: {} },
    multipleAnalysis: {},
  };
  if (view) {
    draft.view = view;
  }

  setColors(draft, usedColors);
  draft.molecules = draft.molecules.concat(MoleculeManager.fromJSON(molecules));
  draft.data = draft.data.concat(initSpectra(spectra, usedColors));
  setCorrelation(draft, correlations);
}

function convertHybridizationStringValuesInCorrelations(
  correlations: CorrelationData,
): CorrelationData {
  return {
    ...correlations,
    values: correlations.values.map((correlation) => {
      if (typeof correlation.hybridization === 'string') {
        let values: number[] = [];
        if (correlation.hybridization.length > 0) {
          const hybridizationString: string =
            correlation.hybridization.replaceAll('SP', '');
          const value = Number(hybridizationString);
          values.push(value);
        }
        correlation.hybridization = values;
      }
      return correlation;
    }),
  };
}

function setPreferences(draft: Draft<State>, data) {
  const emptyPreferences = {
    verticalAlign: null,
  };

  const { verticalAlign = null } = data || emptyPreferences;

  if (verticalAlign) {
    changeSpectrumVerticalAlignment(draft, {
      align: verticalAlign,
    });
  } else {
    changeSpectrumVerticalAlignment(draft, { align: 'auto-check' });
  }
}

function initData(draft: Draft<State>, action) {
  const state = getInitialState();
  const { data } = action.payload;
  setData(state, action.payload);
  setActiveTab(state, { tab: data?.preferences?.activeTab || '' });
  state.width = draft.width;
  state.height = draft.height;
  setPreferences(state, data?.preferences);
  state.isLoading = false;
  state.actionType = action.type;
  return state;
}

function initiate(draft: Draft<State>, action) {
  return initData(draft, action);
}

function loadJcampFile(draft: Draft<State>, actions) {
  const { files } = actions;
  const spectra = addJcamps(files, draft.usedColors);
  draft.data = draft.data.concat(initSpectra(spectra, draft.usedColors));
  setActiveTab(draft);
  changeSpectrumVerticalAlignment(draft, { align: 'auto-check' });

  draft.isLoading = false;
}

function loadDropFiles(draft: Draft<State>, action) {
  const { containsNmrium } = action;
  if (containsNmrium) {
    return initData(draft, action);
  } else {
    setData(draft, action.payload);
    setActiveTab(draft);
    changeSpectrumVerticalAlignment(draft, { align: 'auto-check' });
    draft.actionType = action.type;
    draft.isLoading = false;
  }
}

export { setIsLoading, initiate, loadJcampFile, loadDropFiles };
