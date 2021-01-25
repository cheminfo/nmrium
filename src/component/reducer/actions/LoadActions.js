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

function initiate(draft, dataObject) {
  HorizontalZoomHistory.initiate();
  initiateObject(dataObject.AnalysisObj);
  const spectraData = AnalysisObj.getSpectraData();
  const molecules = AnalysisObj.getMolecules();
  const preferences = AnalysisObj.getPreferences('1d');
  const correlations = AnalysisObj.getCorrelations();
  const spectraAanalysis = AnalysisObj.getMultipleAnalysis();

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
    changeSpectrumDisplayPreferences(draft, {
      center: preferences.display.center,
    });
  } else {
    setYAxisShift(spectraData, draft, draft.height);
  }
  setActiveTab(draft);
}

function setData(draft, data) {
  for (let d of data) {
    AnalysisObj.pushDatum(new Datum1D(d));
  }
  const spectraData = AnalysisObj.getSpectraData();
  const molecules = AnalysisObj.getMolecules();
  const correlations = AnalysisObj.getCorrelations();
  const spectraAanalysis = AnalysisObj.getMultipleAnalysis();

  draft.data = spectraData;
  draft.molecules = molecules;
  draft.correlations = correlations;
  draft.spectraAanalysis = spectraAanalysis;
  draft.isLoading = false;
  setActiveTab(draft);
  initZoom1DHandler(draft.data);
}

function loadJDFFile(draft, files) {
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
}

function loadJcampFile(draft, files) {
  AnalysisObj.addJcamps(files);
  draft.data = AnalysisObj.getSpectraData();
  setActiveTab(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function handleLoadJsonFile(draft, data) {
  initiateObject(data.AnalysisObj);
  const spectraData = AnalysisObj.getSpectraData();
  const molecules = AnalysisObj.getMolecules();
  const preferences = AnalysisObj.getPreferences('1d');
  const correlations = AnalysisObj.getCorrelations();
  const spectraAanalysis = AnalysisObj.getMultipleAnalysis();

  draft.data = spectraData;
  draft.molecules = molecules;
  draft.preferences = preferences;
  draft.correlations = correlations;
  draft.spectraAanalysis = spectraAanalysis;
  if (
    preferences.display &&
    Object.prototype.hasOwnProperty.call(preferences.display, 'center')
  ) {
    changeSpectrumDisplayPreferences(draft, {
      center: preferences.display.center,
    });
  } else {
    setYAxisShift(spectraData, draft, draft.height);
  }

  setActiveTab(draft);
  initZoom1DHandler(draft.data);

  draft.isLoading = false;
}

function handleLoadMOLFile(draft, files) {
  const filesLength = files.length;
  for (let i = 0; i < filesLength; i++) {
    AnalysisObj.addMolfile(files[i].binary.toString());
  }
  const molecules = AnalysisObj.getMolecules();

  draft.molecules = molecules;
  draft.isLoading = false;
}

async function loadZipFile(files) {
  await AnalysisObj.fromZip(files);
}

function handleLoadZIPFile(draft) {
  draft.data = AnalysisObj.getSpectraData();
  setActiveTab(draft);
  initZoom1DHandler(draft.data);
  draft.isLoading = false;
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
