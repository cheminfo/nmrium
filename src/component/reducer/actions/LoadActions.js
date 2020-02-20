import { produce } from 'immer';

import { Datum1D } from '../../../data/data1d/Datum1D';
import getColor from '../../utility/ColorGenerator';
import { AnalysisObj, initiateObject } from '../core/Analysis';

import { setMode, getDomain, setDomain } from './DomainActions';
import { setYAxisShift } from './ToolsActions';
import { changeSpectrumDisplayPreferences } from './PreferencesActions';

const setIsLoading = (state, isLoading) => {
  return { ...state, isLoading };
};

const initiate = (state, dataObject) => {
  return produce(state, (draft) => {
    initiateObject(dataObject.AnalysisObj);
    const spectraData = AnalysisObj.getSpectraData();
    const domain = getDomain(spectraData);
    draft.data = spectraData;
    draft.molecules = AnalysisObj.getMolecules();
    draft.xDomain = domain.x;
    draft.yDomain = domain.y;
    draft.originDomain = domain;
    draft.yDomains = domain.yDomains;
    draft.isLoading = false;
    const preferences = AnalysisObj.getPreferences('1d');
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
    setMode(draft);
  });
};

const setData = (state, data) => {
  // AnalysisObj= new Analysis()
  return produce(state, (draft) => {
    for (let d of data) {
      AnalysisObj.pushDatum(new Datum1D(d));
    }
    draft.data = AnalysisObj.getSpectraData();
    draft.molecules = AnalysisObj.getMolecules();

    draft.isLoading = false;
    setDomain(draft);
    setMode(draft);
  });
};

const loadJcampFile = (state, files) => {
  return produce(state, (draft) => {
    let usedColors = draft.data.map((d) => d.color);
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      const color = getColor(usedColors);
      AnalysisObj.addJcamp(files[i].binary.toString(), {
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
    draft.isLoading = false;
  });
};

const handleLoadJsonFile = (state, data) => {
  return produce(state, (draft) => {
    initiateObject(data.AnalysisObj);
    const spectraData = AnalysisObj.getSpectraData();
    draft.data = spectraData;
    draft.molecules = AnalysisObj.getMolecules();
    const preferences = AnalysisObj.getPreferences('1d');
    draft.preferences = preferences;
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

    setDomain(draft);
    setMode(draft);
    draft.isLoading = false;
  });
};

const handleLoadMOLFile = (state, files) => {
  return produce(state, (draft) => {
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      AnalysisObj.addMolfile(files[i].binary.toString());
    }
    draft.molecules = AnalysisObj.getMolecules();
    draft.isLoading = false;
  });
};
async function loadZipFile(files) {
  await AnalysisObj.fromZip(files);
}

function handleLoadZIPFile(state) {
  return produce(state, (draft) => {
    draft.data = AnalysisObj.getSpectraData();
    setDomain(draft);
    setMode(draft);
    draft.isLoading = false;
  });
}

export {
  setIsLoading,
  initiate,
  setData,
  loadJcampFile,
  handleLoadJsonFile,
  handleLoadMOLFile,
  handleLoadZIPFile,
  loadZipFile,
};
