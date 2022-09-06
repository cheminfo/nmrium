import { Draft } from 'immer';
import { buildCorrelationData, CorrelationData } from 'nmr-correlation';

import { addJcamps, addJDFs } from '../../../data/SpectraManager';
import { StateMoleculeExtended } from '../../../data/molecules/Molecule';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { UsedColors } from '../../../types/UsedColors';
import { NMRiumPreferences, Spectra } from '../../NMRium';
import { DefaultTolerance } from '../../panels/SummaryPanel/CorrelationTable/Constants';
import { getInitialState, State } from '../Reducer';
import { INITIATE, LOAD_JSON_FILE, LOAD_NMREDATA_FILE } from '../types/Types';

import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { setActiveTab } from './ToolsActions';
import { initiateDatum1D } from '../../../data/data1d/Spectrum1D';
import { initiateDatum2D } from '../../../data/data2d/Spectrum2D';

function setIsLoading(draft: Draft<State>, isLoading: boolean) {
  draft.isLoading = isLoading;
}

function setColors(draft: Draft<State>, colors: UsedColors) {
  draft.usedColors['1d'] = draft.usedColors['1d'].concat(colors['1d']);
  draft.usedColors['2d'] = draft.usedColors['2d'].concat(colors['2d']);
}

function setData(
  draft: Draft<State>,
  data: {
    spectra: Spectra;
    molecules: StateMoleculeExtended[];
    preferences: NMRiumPreferences;
    correlations: CorrelationData;
    usedColors: UsedColors;
  },
) {
  const { spectra, molecules, correlations, usedColors } = data || {
    spectra: [],
    molecules: [],
    correlations: {},
    multipleAnalysis: {},
    exclusionZones: [],
  };

  setColors(draft, usedColors);
  draft.data = spectra;
  draft.molecules = MoleculeManager.fromJSON(molecules);

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

function initiate(draft: Draft<State>, action) {
  const state = getInitialState();

  setData(state, action.payload);
  const preferences = action.payload?.preferences || {};
  setActiveTab(state, { tab: preferences?.activeTab || '' });
  state.width = draft.width;
  state.height = draft.height;
  setPreferences(state, action.payload);
  state.isLoading = false;
  state.actionType = INITIATE;
  return state;
}

function loadJDFFile(draft: Draft<State>, actions) {
  const { files } = actions;
  const spectra = addJDFs(files, draft.usedColors);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }

  setActiveTab(draft);

  draft.isLoading = false;
}

function loadJcampFile(draft: Draft<State>, actions) {
  const { files } = actions;
  const spectra = addJcamps(files, draft.usedColors);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }
  setActiveTab(draft);
  changeSpectrumVerticalAlignment(draft, { align: 'auto-check' });

  draft.isLoading = false;
}

function handleLoadJsonFile(draft: Draft<State>, action) {
  const state = getInitialState();

  setData(state, action.payload);
  const preferences = action.payload?.preferences || {};
  setActiveTab(state, { tab: preferences?.activeTab || '' });
  state.width = draft.width;
  state.height = draft.height;
  setPreferences(state, preferences);
  state.isLoading = false;
  state.actionType = LOAD_JSON_FILE;
  return state;
}

function handleLoadMOLFile(draft: Draft<State>, actions) {
  const { files } = actions;
  for (let file of files) {
    MoleculeManager.addMolfile(draft.molecules, file.binary.toString());
  }
  draft.isLoading = false;
}

function handleLoadZIPFile(draft: Draft<State>, action) {
  const { data, usedColors } = action.payload;
  draft.data = draft.data.concat(data);
  setColors(draft, usedColors);

  setActiveTab(draft);
  changeSpectrumVerticalAlignment(draft, { align: 'auto-check' });

  draft.isLoading = false;
}

function handleLoadNmredata(draft: Draft<State>, action) {
  const state = getInitialState();

  setData(state, action.payload);
  setActiveTab(state);
  changeSpectrumVerticalAlignment(state, { align: 'auto-check' });
  state.isLoading = false;
  state.width = draft.width;
  state.height = draft.height;
  state.actionType = LOAD_NMREDATA_FILE;

  return state;
}

function loadDropFiles(draft: Draft<State>, actions) {
  const { data, usedColors } = actions;
  const { spectra, molecules } = data;
  for (let spectrum of spectra) {
    const { info } = spectrum;
    if (info.dimension === 1) {
      draft.data.push(initiateDatum1D(spectrum, usedColors));
    } else if (info.dimension === 2) {
      draft.data.push(initiateDatum2D(spectrum, usedColors));
    }
  }
  for (let molecule of molecules) {
    MoleculeManager.addMolfile(draft.molecules, molecule.molfile);
  }
  setActiveTab(draft);

  draft.isLoading = false;
}

export {
  setIsLoading,
  initiate,
  loadJcampFile,
  loadJDFFile,
  loadDropFiles,
  handleLoadJsonFile,
  handleLoadNmredata,
  handleLoadMOLFile,
  handleLoadZIPFile,
};
