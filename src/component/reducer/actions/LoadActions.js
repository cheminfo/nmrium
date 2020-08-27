import { produce } from 'immer';

import { Datum1D } from '../../../data/data1d/Datum1D';
import getColor from '../../../data/utilities/getColor';
import { AnalysisObj, initiateObject } from '../core/Analysis';

import { setMode, setDomain } from './DomainActions';
import { changeSpectrumDisplayPreferences } from './PreferencesActions';
import { setYAxisShift, setActiveTab } from './ToolsActions';

const setIsLoading = (state, isLoading) => {
  return { ...state, isLoading };
};

const initiate = (state, dataObject) => {
  initiateObject(dataObject.AnalysisObj);

  return produce(state, (draft) => {
    const spectraData = AnalysisObj.getSpectraData();
    // const domain = getDomain(spectraData);
    draft.data = spectraData;
    draft.molecules = AnalysisObj.getMolecules();
    // draft.xDomain = domain.xDomain;
    // draft.yDomain = domain.yDomain;
    // draft.originDomain = domain;
    // draft.yDomains = domain.yDomains;
    // draft.xDomains = domain.xDomains;
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
    setActiveTab(draft);

    // setDomain(draft);
    // setMode(draft);
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
    setActiveTab(draft);

    // setDomain(draft);
    // setMode(draft);
  });
};

const loadJDFFile = (state, files) => {
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
    draft.isLoading = false;
  });
};

const loadJcampFile = (state, files) => {
  return produce(state, (draft) => {
    let usedColors = draft.data.map((d) => d.color);
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      const color = getColor(false, usedColors);
      AnalysisObj.addJcamp(files[i].binary.toString(), {
        display: {
          name: files[i].name,
          color: color,
          // isVisible: true,
          // isPeaksMarkersVisible: true,
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
  initiateObject(data.AnalysisObj);

  return produce(state, (draft) => {
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

    setActiveTab(draft);

    // setDomain(draft);
    // setMode(draft);
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
  loadJDFFile,
  handleLoadJsonFile,
  handleLoadMOLFile,
  handleLoadZIPFile,
  loadZipFile,
};
