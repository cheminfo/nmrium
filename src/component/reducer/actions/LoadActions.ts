import { Draft } from 'immer';
import { buildCorrelationData, Types } from 'nmr-correlation';

import { addJcamps, addJDFs } from '../../../data/SpectraManager';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { Molecules, NMRiumPreferences, Spectra } from '../../NMRium';
import { DefaultTolerance } from '../../panels/SummaryPanel/CorrelationTable/Constants';
import { State } from '../Reducer';

import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { setActiveTab } from './ToolsActions';

function setIsLoading(draft: Draft<State>, isLoading: boolean) {
  draft.isLoading = isLoading;
}

function setData(
  draft: Draft<State>,
  data: {
    spectra: Spectra;
    molecules: Molecules;
    preferences: NMRiumPreferences;
    correlations: Types.CorrelationData;
    exclusionZones: any;
  },
) {
  const {
    spectra,
    molecules,
    correlations,
    exclusionZones = {},
  } = data || {
    spectra: [],
    molecules: [],
    correlations: {},
    multipleAnalysis: {},
    exclusionZones: {},
  };

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
  const { files, usedColors } = actions;
  const spectra = addJDFs(files, usedColors);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }

  setActiveTab(draft);

  draft.isLoading = false;
}

function loadJcampFile(draft: Draft<State>, actions) {
  const { files, usedColors } = actions;
  const spectra = addJcamps(files, usedColors);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }
  changeSpectrumVerticalAlignment(draft, { checkData: true });
  setActiveTab(draft);

  draft.isLoading = false;
}

function handleLoadJsonFile(draft: Draft<State>, actions) {
  const data = actions.payload;
  setData(draft, data);

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
  draft.data = action.payload;
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
