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
    draft.correlations = correlations;
  }
}

function initiate(draft: Draft<State>, action) {
  setData(draft, action.payload);
  changeSpectrumVerticalAlignment(draft, { checkData: true });
  setActiveTab(draft);
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
  changeSpectrumVerticalAlignment(draft, { checkData: true });
  setActiveTab(draft);

  draft.isLoading = false;
}

function handleLoadJsonFile(draft: Draft<State>, action) {
  setData(draft, action.payload);

  changeSpectrumVerticalAlignment(draft, { checkData: true });

  setActiveTab(draft);

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

  changeSpectrumVerticalAlignment(draft, { checkData: true });
  setActiveTab(draft);
  draft.isLoading = false;
}

function handleLoadNmredata(draft: Draft<State>, action) {
  setData(draft, action.payload);
  changeSpectrumVerticalAlignment(draft, { checkData: true });
  setActiveTab(draft);
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
