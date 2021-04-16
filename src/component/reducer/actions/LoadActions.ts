import { Draft } from 'immer';
import lodashGet from 'lodash/get';
import { buildCorrelationData, Types } from 'nmr-correlation';

import { addJcamps, addJDFs } from '../../../data/SpectraManager';
import { initiateDatum1D } from '../../../data/data1d/Datum1D';
import { initiateDatum2D } from '../../../data/data2d/Datum2D';
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
  },
) {
  const {
    spectra,
    molecules,
    preferences,
    correlations,
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

  if (!correlations || Object.keys(correlations).length === 0) {
    draft.correlations = buildCorrelationData(
      [],
      { tolerance: DefaultTolerance, mf: '' },
      [],
    );
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

function handleLoadJsonFile(draft: Draft<State>, files) {
  const data = JSON.parse(files[0].binary.toString());

  for (const i in data.spectra) {
    if (data.spectra[i].info?.dimension === 1) {
      data.spectra[i] = initiateDatum1D(data.spectra[i]);
    } else if (data.spectra[i].info?.dimension === 2) {
      data.spectra[i] = initiateDatum2D(data.spectra[i]);
    }
  }

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

export {
  setIsLoading,
  initiate,
  loadJcampFile,
  loadJDFFile,
  handleLoadJsonFile,
  handleLoadMOLFile,
  handleLoadZIPFile,
};
