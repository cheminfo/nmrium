import { Draft } from 'immer';
import lodashGet from 'lodash/get';
import { buildCorrelationData, Types } from 'nmr-correlation';

import { addJcamps, addJDFs } from '../../../data/SpectraManager';
import { initiateDatum1D } from '../../../data/data1d/Spectrum1D';
import { initiateDatum2D } from '../../../data/data2d/Spectrum2D';
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
  draft.toolOptions.data.exclusionZones = exclusionZones;

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

function loadDropFiles(draft: Draft<State>, actions) {
  const { data, usedColors } = actions;
  const { spectra, molecules } = data;
  for (let spectrum of spectra) {
    const { info } = spectrum;
    console.log('info load Drop', info)
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
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function loadJDFFile(draft: Draft<State>, actions) {
  const { files, usedColors } = actions;
  const spectra = addJDFs(files, usedColors);
  for (const spectrum of spectra) {
    draft.data.push(spectrum);
  }

  setActiveTab(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function loadJcampFile(draft: Draft<State>, actions) {
  const { files, usedColors } = actions;
  const spectra = addJcamps(files, usedColors);
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
  loadDropFiles,
  loadJcampFile,
  loadJDFFile,
  handleLoadJsonFile,
  handleLoadNmredata,
  handleLoadMOLFile,
  handleLoadZIPFile,
};
