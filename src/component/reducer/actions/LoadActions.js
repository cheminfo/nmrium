import get from 'lodash/get';

import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import generateID from '../../../data/utilities/generateID';
import { AnalysisObj } from '../core/Analysis';
import HorizontalZoomHistory from '../helper/HorizontalZoomHistory';

import { setMode, setDomain } from './DomainActions';
import { changeSpectrumDisplayPreferences } from './PreferencesActions';
import { setYAxisShift, setActiveTab } from './ToolsActions';
import { initZoom1DHandler } from './Zoom';

function setIsLoading(draft, isLoading) {
  draft.isLoading = isLoading;
}

function setData(draft, data) {
  const {
    spectra,
    molecules,
    preferences,
    // correlations,
    // multipleAnalysis,
  } = data || {
    spectra: [],
    molecules: [],
    preferences: {},
    correlations: {},
    multipleAnalysis: {},
  };
  draft.data = spectra;
  draft.molecules = MoleculeManager.fromJSON(molecules);
  draft.preferences = preferences;
  // const correlations = AnalysisObj.getCorrelations();
  // const spectraAanalysis = AnalysisObj.getMultipleAnalysis();
}

function initiate(draft, action) {
  HorizontalZoomHistory.initiate();
  draft.displayerKey = generateID();
  setData(draft, action.payload);
  initZoom1DHandler(draft.data);
  const alignCenter = get(draft.preferences, 'display.center', null);
  if (alignCenter) {
    changeSpectrumDisplayPreferences(draft, {
      center: alignCenter,
    });
  } else {
    setYAxisShift(draft, draft.height);
  }
  setActiveTab(draft);
  draft.isLoading = false;
}

function loadJDFFile(draft, files) {
  const spectra = AnalysisObj.addJDFs(files);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }
  setDomain(draft);
  setMode(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function loadJcampFile(draft, files) {
  const spectra = AnalysisObj.addJcamps(files);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }
  setActiveTab(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function handleLoadJsonFile(draft, files) {
  const data = JSON.parse(files[0].binary.toString());
  setData(draft, data);
  const alignCenter = get(draft.preferences, 'display.center', null);

  if (alignCenter) {
    changeSpectrumDisplayPreferences(draft, {
      center: alignCenter,
    });
  } else {
    setYAxisShift(draft, draft.height);
  }

  setActiveTab(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function handleLoadMOLFile(draft, files) {
  for (let i = 0; i < files.length; i++) {
    const moelcules = AnalysisObj.addMolfile(files[i].binary.toString());
    for (let m of moelcules) {
      draft.molecules.push(m);
    }
  }
  draft.isLoading = false;
}

function handleLoadZIPFile(draft, action) {
  draft.data = action.payload;
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
  handleLoadMOLFile,
  handleLoadZIPFile,
};
