import { Draft } from 'immer';
import { buildCorrelationData, Types } from 'nmr-correlation';

import { addJcamps, addJDFs } from '../../../data/SpectraManager';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { UsedColors } from '../../../types/UsedColors';
import { Molecules, NMRiumPreferences, Spectra } from '../../NMRium';
import { DefaultTolerance } from '../../panels/SummaryPanel/CorrelationTable/Constants';
import { State } from '../Reducer';

import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { setActiveTab } from './ToolsActions';

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
    molecules: Molecules;
    preferences: NMRiumPreferences;
    correlations: Types.CorrelationData;
    exclusionZones: any;
    usedColors: UsedColors;
  },
) {
  const {
    spectra,
    molecules,
    correlations,
    exclusionZones = {},
    usedColors,
  } = data || {
    spectra: [],
    molecules: [],
    correlations: {},
    multipleAnalysis: {},
    exclusionZones: {},
  };
  setColors(draft, usedColors);
  draft.data = spectra;
  draft.molecules = MoleculeManager.fromJSON(molecules);
  draft.toolOptions.data.exclusionZones = exclusionZones;

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
  correlations: Types.CorrelationData,
): Types.CorrelationData {
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
  setData(draft, action.payload);
  const preferences = action.payload?.preferences || {};
  setActiveTab(draft, { tab: preferences?.activeTab || '' });
  setPreferences(draft, action.payload);
  draft.isLoading = false;
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
  setData(draft, action.payload);
  const preferences = action.payload?.preferences || {};
  setActiveTab(draft, { tab: preferences?.activeTab || '' });
  setPreferences(draft, preferences);

  draft.isLoading = false;
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
  setData(draft, action.payload);
  setActiveTab(draft);
  changeSpectrumVerticalAlignment(draft, { align: 'auto-check' });
  draft.isLoading = false;
}

export {
  setIsLoading,
  initiate,
  loadJcampFile,
  loadJDFFile,
  handleLoadJsonFile,
  handleLoadNmredata,
  handleLoadMOLFile,
  handleLoadZIPFile,
};
