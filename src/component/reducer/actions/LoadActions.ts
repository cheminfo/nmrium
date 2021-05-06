import { Draft } from 'immer';
import lodashGet from 'lodash/get';
import { buildCorrelationData, Types } from 'nmr-correlation';

import { addJcamps, addJDFs } from '../../../data/SpectraManager';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import generateID from '../../../data/utilities/generateID';
import { Molecules, NMRiumPreferences, Spectra } from '../../NMRium';
import { DefaultTolerance } from '../../panels/SummaryPanel/CorrelationTable/Constants';
import { State } from '../Reducer';

import { changeSpectrumVerticalAlignment } from './PreferencesActions';
import { setActiveTab } from './ToolsActions';
import { initZoom1DHandler } from './Zoom';

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
    preferences,
    correlations,
    exclusionZones = {},
  } = data || {
    spectra: [],
    molecules: [],
    preferences: {},
    correlations: {},
    multipleAnalysis: {},
    exclusionZones: {},
  };
  draft.data = spectra;
  draft.molecules = MoleculeManager.fromJSON(molecules);
  draft.preferences = preferences;
  draft.exclusionZones = exclusionZones;

  if (!correlations || Object.keys(correlations).length === 0) {
    draft.correlations = buildCorrelationData([], {
      tolerance: DefaultTolerance,
    });
  } else {
    draft.correlations = correlations;
  }

  // const spectraAnalysis = AnalysisObj.getMultipleAnalysis();
}

function initiate(draft: Draft<State>, action) {
  draft.displayerKey = generateID();
  setData(draft, action.payload);
  initZoom1DHandler(draft.data);
  const alignCenter = lodashGet(draft.preferences, 'display.center', null);
  changeSpectrumVerticalAlignment(draft, alignCenter, true);
  setActiveTab(draft);
  draft.isLoading = false;
}

function loadJDFFile(draft: Draft<State>, files) {
  const spectra = addJDFs(files);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }

  setActiveTab(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function loadJcampFile(draft: Draft<State>, files) {
  const spectra = addJcamps(files);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }
  changeSpectrumVerticalAlignment(draft, false, true);
  setActiveTab(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function handleLoadJsonFile(draft: Draft<State>, actions) {
  const data = actions.payload;
  setData(draft, data);

  const alignCenter = lodashGet(draft.preferences, 'display.center', null);

  changeSpectrumVerticalAlignment(draft, alignCenter, true);

  setActiveTab(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function handleLoadMOLFile(draft: Draft<State>, files) {
  for (let file of files) {
    MoleculeManager.addMolfile(draft.molecules, file.binary.toString());
  }
  draft.isLoading = false;
}

function handleLoadZIPFile(draft: Draft<State>, action) {
  draft.data = action.payload;
  setActiveTab(draft);
  initZoom1DHandler(draft.data);
  draft.isLoading = false;
}

function handleLoadNmredata(draft: Draft<State>, action) {
  setData(draft, action.payload);
  changeSpectrumVerticalAlignment(draft, false, true);
  setActiveTab(draft);
  initZoom1DHandler(draft.data);
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
