import { produce } from 'immer';

import { Datum1D } from '../../../data/data1d/Datum1D';
import getColor from '../../../data/utilities/getColor';
import { AnalysisObj, initiateObject } from '../core/Analysis';
import HorizontalZoomHistory from '../helper/HorizontalZoomHistory';

import { setMode, setDomain } from './DomainActions';
import { changeSpectrumDisplayPreferences } from './PreferencesActions';
import { setYAxisShift, setActiveTab } from './ToolsActions';
import { initZoom1DHandler } from './Zoom';

function setIsLoading(state, isLoading) {
  return { ...state, isLoading };
}

function initiate(state, dataObject) {
  HorizontalZoomHistory.initiate();
  initiateObject(dataObject.AnalysisObj);
  const spectraData = AnalysisObj.getSpectraData();
  const molecules = AnalysisObj.getMolecules();
  const preferences = AnalysisObj.getPreferences('1d');
  const correlations = AnalysisObj.getCorrelations();
  const spectraAanalysis = AnalysisObj.getMultipleAnalysis();

  return produce(state, (draft) => {
    draft.data = spectraData;
    draft.molecules = molecules;
    draft.correlations = correlations;
    draft.spectraAanalysis = spectraAanalysis;
    initZoom1DHandler(draft.data);
    draft.isLoading = false;
    if (
      preferences.display &&
      Object.prototype.hasOwnProperty.call(preferences.display, 'center')
    ) {
      changeSpectrumDisplayPreferences(state, draft, {
        center: preferences.display.center,
      });
    } else {
      setYAxisShift(spectraData, draft, state.height);
    }
    setActiveTab(draft);
  });
}

function setData(state, data) {
  for (let d of data) {
    AnalysisObj.pushDatum(new Datum1D(d));
  }
  const spectraData = AnalysisObj.getSpectraData();
  const molecules = AnalysisObj.getMolecules();
  const correlations = AnalysisObj.getCorrelations();
  const spectraAanalysis = AnalysisObj.getMultipleAnalysis();

  return produce(state, (draft) => {
    draft.data = spectraData;
    draft.molecules = molecules;
    draft.correlations = correlations;
    draft.spectraAanalysis = spectraAanalysis;
    draft.isLoading = false;
    setActiveTab(draft);
    initZoom1DHandler(draft.data);
  });
}

function loadJDFFile(state, files) {
  return produce(state, (draft) => {
    let usedColors = draft.data.map((d) => d.color);
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      const color = getColor(false, usedColors);
      AnalysisObj.addJDF(files[i].binary, {
        display: {
          name: files[i].name,
          color: color,
          isVisible: true,
          isPeaksMarkersVisible: true,
        },
        source: {
          jcampURL: files[i].jcampURL ? files[i].jcampURL : null,
        },
      });
      usedColors.push(color);
    }
    draft.data = AnalysisObj.getSpectraData();
    setDomain(draft);
    setMode(draft);
    initZoom1DHandler(draft.data);

    draft.isLoading = false;
  });
}

function loadJcampFile(state, files) {
  return produce(state, (draft) => {
    AnalysisObj.addJcamps(files);
    draft.data = AnalysisObj.getSpectraData();
    setActiveTab(draft);
    initZoom1DHandler(draft.data);

    draft.isLoading = false;
  });
}

function handleLoadJsonFile(state, data) {
  initiateObject(data.AnalysisObj);
  const spectraData = AnalysisObj.getSpectraData();
  const molecules = AnalysisObj.getMolecules();
  const preferences = AnalysisObj.getPreferences('1d');
  const correlations = AnalysisObj.getCorrelations();
  const spectraAanalysis = AnalysisObj.getMultipleAnalysis();

  return produce(state, (draft) => {
    draft.data = spectraData;
    draft.molecules = molecules;
    draft.preferences = preferences;
    draft.correlations = correlations;
    draft.spectraAanalysis = spectraAanalysis;
    if (
      preferences.display &&
      Object.prototype.hasOwnProperty.call(preferences.display, 'center')
    ) {
      changeSpectrumDisplayPreferences(state, draft, {
        center: preferences.display.center,
      });
    } else {
      setYAxisShift(spectraData, draft, state.height);
    }

    setActiveTab(draft);
    initZoom1DHandler(draft.data);

    draft.isLoading = false;
  });
}

function handleLoadMOLFile(state, files) {
  const filesLength = files.length;
  for (let i = 0; i < filesLength; i++) {
    AnalysisObj.addMolfile(files[i].binary.toString());
  }
  const molecules = AnalysisObj.getMolecules();

  return produce(state, (draft) => {
    draft.molecules = molecules;
    draft.isLoading = false;
  });
}

async function loadZipFile(files) {
  await AnalysisObj.fromZip(files);
}

function handleLoadZIPFile(state) {
  return produce(state, (draft) => {
    draft.data = AnalysisObj.getSpectraData();
    setActiveTab(draft);
    initZoom1DHandler(draft.data);
    draft.isLoading = false;
  });
}

export {
  setIsLoading,
  initiate,
  setData,
  loadJcampFile,
  loadJDFFile,
  handleLoadJsonFile,
  handleLoadMOLFile,
  handleLoadZIPFile,
  loadZipFile,
};
