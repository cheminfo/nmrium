import { produce } from 'immer';
import * as d3 from 'd3';

import { SHIFT_X } from '../../data/data1d/filter1d/filter1d-type';
import { Datum1D } from '../../data/data1d/Datum1D';
import { Data1DManager } from '../../data/data1d/Data1DManager';
import getColor from '../utility/ColorGenerator';
import { Analysis } from '../../data/Analysis';

import { UNDO, REDO, RESET } from './HistoryActions';
import {
  INITIATE,
  SAVE_DATA_AS_JSON,
  PEAK_PICKING,
  DELETE_PEAK_NOTATION,
  SHIFT_SPECTRUM,
  LOAD_JCAMP_FILE,
  LOAD_JSON_FILE,
  LOAD_MOL_FILE,
  SET_DATA,
  SET_ORIGINAL_DOMAIN,
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_WIDTH,
  SET_DIMENSIONS,
  SET_POINTER_COORDINATES,
  SET_SELECTED_TOOL,
  FULL_ZOOM_OUT,
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHNAGE_ACTIVE_SPECTRUM,
  CHNAGE_SPECTRUM_COLOR,
  ADD_INTEGRAL,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
  SET_ZOOM_FACTOR,
  ADD_MOLECULE,
  SET_MOLECULE,
  DELETE_MOLECULE,
  DELETE_SPECTRA,
  CHANGE_SPECTRUM_DIPSLAY_VIEW_MODE,
} from './Actions';

let AnalysisObj = new Analysis();

function getDomain(data) {
  let xArray = data.reduce(
    (acc, d) => acc.concat([d.x[0], d.x[d.x.length - 1]]),
    [],
  );
  let yDomains = [];
  let yArray = data.reduce((acc, d, i) => {
    const extent = d3.extent(d.y);
    yDomains[i] = extent;
    return acc.concat(extent);
  }, []);

  return { x: d3.extent(xArray), y: d3.extent(yArray), yDomains: yDomains };
}

const getScale = ({ xDomain, yDomain, width, height, margin, mode }) => {
  const xRange =
    mode === 'RTL'
      ? [width - margin.right, margin.left]
      : [margin.left, width - margin.right];

  const x = d3.scaleLinear(xDomain, xRange);
  const y = d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
  return { x, y };
};

const initiate = (state, data) => {
  AnalysisObj = data.AnalysisObj;
  return produce(state, (draft) => {
    const spectraData = AnalysisObj.getData1d();
    const domain = getDomain(spectraData);
    draft.data = AnalysisObj.getData1d();
    draft.molecules = AnalysisObj.getMolecules();
    draft.xDomain = domain.x;
    draft.yDomain = domain.y;
    draft.originDomain = domain;
    draft.yDomains = domain.yDomains;
    draft.mode =
      spectraData && spectraData[0] && spectraData[0].isFid ? 'LTR' : 'RTL';
  });
};

const saveDataAsJson = (state) => {
  const data = AnalysisObj.toJSON();

  const fileData = JSON.stringify(data, undefined, 2);
  const blob = new Blob([fileData], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'experiment.json';
  link.href = url;
  link.dispatchEvent(
    new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  return state;
};

const setData = (state, data) => {
  // AnalysisObj= new Analysis()
  return produce(state, (draft) => {
    for (let d of data) {
      AnalysisObj.pushDatum1D(new Datum1D(d));
    }
    draft.data = AnalysisObj.getData1d();
    draft.molecules = AnalysisObj.getMolecules();
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
      let datumObject = Data1DManager.fromJcamp(files[i].binary.toString(), {
        display: {
          name: files[i].name,
          color: color,
          isVisible: true,
          isPeaksMarkersVisible: true,
        },
      });
      usedColors.push(color);
      AnalysisObj.pushDatum1D(datumObject);
    }

    draft.data = AnalysisObj.getData1d();
    setDomain(draft);
    setMode(draft);
  });
};

const handleLoadJsonFile = (state, data) => {
  return produce(state, (draft) => {
    AnalysisObj = data.AnalysisObj;
    draft.data = AnalysisObj.getData1d();
    draft.molecules = AnalysisObj.getMolecules();
    setDomain(draft);
    setMode(draft);
  });
};

const handleLoadMOLFile = (state, files) => {
  return produce(state, (draft) => {
    const filesLength = files.length;
    for (let i = 0; i < filesLength; i++) {
      AnalysisObj.addMolfile(files[i].binary.toString());
    }
    draft.molecules = AnalysisObj.getMolecules();
  });
};

const getClosePeak = (xShift, mouseCoordinates, state) => {
  const scale = getScale(state);
  const { data, activeSpectrum, mode } = state;
  const zoon = [
    scale.x.invert(mouseCoordinates.x - xShift),
    scale.x.invert(mouseCoordinates.x + xShift),
  ];

  //get the active sepectrum data by looking for it by id
  const selectedSpectrumData = data.find((d) => d.id === activeSpectrum.id);
  const maxIndex =
    selectedSpectrumData.x.findIndex(
      (number) => number >= zoon[mode === 'RTL' ? 0 : 1],
    ) - 1;
  const minIndex = selectedSpectrumData.x.findIndex(
    (number) => number >= zoon[mode === 'RTL' ? 1 : 0],
  );

  const selectedYData = selectedSpectrumData.y.slice(minIndex, maxIndex);

  const peakYValue = d3.max(selectedYData);
  const xIndex = selectedYData.findIndex((value) => value === peakYValue);
  const peakXValue = selectedSpectrumData.x[minIndex + xIndex];

  return { x: peakXValue, y: peakYValue, xIndex: minIndex + xIndex };
};

const addPeak = (state, mouseCoordinates) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const spectrumID = state.activeSpectrum.id;
      const index = draft.data.findIndex((d) => d.id === spectrumID);

      const peak = getClosePeak(10, mouseCoordinates, state);
      if (index !== -1) {
        if (draft.data[index].peaks) {
          draft.data[index].peaks.push({ xIndex: peak.xIndex });
        } else {
          draft.data[index].peaks = [{ xIndex: peak.xIndex }];
        }

        AnalysisObj.getDatum1D(spectrumID).setPeaks(draft.data[index].peaks);
      }
    }
  });
};

const deletePeak = (state, peakData) => {
  return produce(state, (draft) => {
    const spectrumID = state.activeSpectrum.id;
    const index = draft.data.findIndex((d) => d.id === spectrumID);
    draft.data[index].peaks = draft.data[index].peaks.filter(
      (p) => p.xIndex !== peakData.xIndex,
    );
    AnalysisObj.getDatum1D(spectrumID).setPeaks(draft.data[index].peaks);
  });
};

const addIntegral = (state, integralData) => {
  return produce(state, (draft) => {
    const integralID = integralData.id;
    const index = draft.data.findIndex((d) => d.id === integralID);
    delete integralData.id;

    if (index !== -1) {
      if (draft.data[index].integrals) {
        draft.data[index].integrals.push(integralData);
      } else {
        draft.data[index].integrals = [integralData];
      }

      AnalysisObj.getDatum1D(integralID).setIntegrals(
        draft.data[index].integrals,
      );
    }
  });
};

const shiftSpectrumAlongXAxis = (state, shiftValue) => {
  return produce(state, (draft) => {
    const filterOption = {
      kind: SHIFT_X,
      value: shiftValue,
    };
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum1D(activeSpectrumId);

    //apply filter into the spectrum
    activeObject.addFilter(filterOption);

    filterOption.id = activeSpectrumId;
    //add the filter action at the history
    const history = handleHistorySet(state.history, filterOption);

    activeObject.applyShiftXFilter(shiftValue);
    //add to undo history

    const XYData = activeObject.getReal();
    const spectrumIndex = draft.data.findIndex(
      (spectrum) => spectrum.id === activeSpectrumId,
    );

    draft.data[spectrumIndex].x = XYData.x;
    draft.data[spectrumIndex].y = XYData.y;
    draft.history = history;
    setDomain(draft);
  });
};

const setOriginalDomain = (state, originDomain) => {
  return produce(state, (draft) => {
    draft.originDomain = originDomain;
  });
};

const setXDomain = (state, xDomain) => {
  return produce(state, (draft) => {
    draft.xDomain = xDomain;
  });
};

const setYDomain = (state, yDomain) => {
  if (state.activeSpectrum === null) {
    const yDomains = state.yDomains.map((y) => {
      return [y[0] + (yDomain[0] - y[0]), y[1] + (yDomain[1] - y[1])];
    });

    return { ...state, yDomain, yDomains };
  } else {
    const index = state.data.findIndex((d) => d.id === state.activeSpectrum.id);
    const yDomains = [...state.yDomains];
    yDomains[index] = yDomain;
    return { ...state, yDomains: yDomains };
  }
};

const setWidth = (state, width) => {
  return { ...state, width };
};

const handleSetDimensions = (state, width, height) => {
  return { ...state, width, height };
};

const setPointerCoordinates = (state, pointerCoordinates) => {
  return { ...state, pointerCoordinates };
};

const setSelectedTool = (state, selectedTool) => {
  return { ...state, selectedTool };
};

const zoomOut = (state) => {
  return produce(state, (draft) => {
    draft.xDomain = state.originDomain.x;
    draft.yDomain = state.originDomain.y;
  });
};

// TODO: this is really strange
const handelSpectrumVisibility = (state, data) => {
  return produce(state, (draft) => {
    for (let datum of draft.data) {
      if (data.some((sData) => sData.id === datum.id)) {
        datum.isVisible = true;
      } else {
        datum.isVisible = false;
      }
    }
  });
};

const handleChangePeaksMarkersVisibility = (state, data) => {
  return produce(state, (draft) => {
    for (let datum of draft.data) {
      if (data.some((activeData) => activeData.id === datum.id)) {
        AnalysisObj.getDatum1D(datum.id).isPeaksMarkersVisible = true;
        datum.isPeaksMarkersVisible = true;
      } else {
        AnalysisObj.getDatum1D(datum.id).isPeaksMarkersVisible = false;
        datum.isPeaksMarkersVisible = false;
      }
    }
  });
};

const handelChangeActiveSpectrum = (state, activeSpectrum) => {
  return produce(state, (draft) => {
    if (activeSpectrum) {
      AnalysisObj.getDatum1D(activeSpectrum.id).isVisible = true;
      const index = draft.data.findIndex((d) => d.id === activeSpectrum.id);
      if (index !== -1) {
        draft.data[index].isVisible = true;
      }
    }
    draft.activeSpectrum = activeSpectrum;
  });
};

const handelChangeSpectrumColor = (state, { id, color }) => {
  return produce(state, (draft) => {
    const index = draft.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      draft.data[index].color = color;
      AnalysisObj.getDatum1D(id).display.color = color;
    }
  });
};

const handleToggleRealImaginaryVisibility = (state) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum === null) return;
    const activeSpectrumId = state.activeSpectrum.id;
    const ob = AnalysisObj.getDatum1D(activeSpectrumId);

    if (ob) {
      const reY = ob.getReal().y;
      const imY = ob.getImaginary().y;
      const index = state.data.findIndex((d) => d.id === activeSpectrumId);
      ob.setIsRealSpectrumVisible(!draft.data[index]);

      draft.data[index].isRealSpectrumVisible = !draft.data[index]
        .isRealSpectrumVisible;
      ob.setIsRealSpectrumVisible();
      // isRealSpectrumVisible
      if (draft.data[index].isRealSpectrumVisible) {
        if (reY !== null && reY !== undefined) {
          draft.data[index].y = reY;
          const domain = getDomain(draft.data);
          draft.xDomain = domain.x;
          draft.yDomain = domain.y;
          draft.yDomains = domain.yDomains;
        }
      } else {
        if (imY !== null && imY !== undefined) {
          draft.data[index].y = imY;
          const domain = getDomain(draft.data);
          draft.xDomain = domain.x;
          draft.yDomain = domain.y;
          draft.yDomains = domain.yDomains;
        }
      }
    }
  });
};

const handelAddMolecule = (state, molfile) => {
  AnalysisObj.addMolfile(molfile);
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.getMolecules();
  });
};

const handeleSetMolecule = (state, molfile, key) => {
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.setMolfile(molfile, key);
  });
};

const handeleDeleteMolecule = (state, key) => {
  return produce(state, (draft) => {
    const index = draft.molecules.findIndex((molecule) => molecule.key === key);
    if (index !== -1) {
      draft.molecules.splice(index, 1);
    }
  });
};

function setMode(draft) {
  draft.mode =
    draft.data && draft.data[0] && draft.data[0].isFid ? 'LTR' : 'RTL';
}

function setDomain(draft) {
  const domain = getDomain(draft.data);
  draft.xDomain = domain.x;
  draft.yDomainh = domain.y;
  draft.originDomain = domain;
  draft.yDomains = domain.yDomains;
}

const handelDeleteSpectra = (state) => {
  return produce(state, (draft) => {
    const { activeSpectrum } = draft;

    if (activeSpectrum && activeSpectrum.id) {
      AnalysisObj.deleteDatum1DByID(activeSpectrum.id);
      draft.data = AnalysisObj.getData1d();
      setDomain(draft);
      setMode(draft);
    }
  });
};

const handleChangeSpectrumDisplayMode = (state) => {
  return produce(state, (draft) => {
    draft.verticalAlign =
      draft.verticalAlign !== 0
        ? 0
        : Math.floor(-draft.height / (draft.data.length + 2));
  });
};

//////////////////////////////////////////////////////////////////////
//////////////// start undo and redo functions ///////////////////////
//////////////////////////////////////////////////////////////////////

const handleHistoryUndo = (state) => {
  const { past, present, future } = state.history;
  const previous = past[past.length - 1];
  const newPast = past.slice(0, past.length - 1);
  const newfuture = [present, ...future];

  const hasRedo = newfuture.length !== 0;
  const hasUndo = past.length !== 0;

  AnalysisObj.undoFilter(past);
  let resultData = AnalysisObj.getData1d();

  const domain = getDomain(resultData);
  const history = {
    past: newPast,
    present: previous,
    future: newfuture,
    hasRedo,
    hasUndo,
  };

  return {
    ...state,
    data: resultData,
    xDomain: domain.x,
    yDomain: domain.y,
    originDomain: domain,
    history,
  };
};

const handleHistoryRedo = (state) => {
  return produce(state, (draft) => {
    const { history } = draft;
    const next = history.future[0];
    const newPresent = history.future.shift();
    history.past.push(history.present);
    history.present = newPresent;
    history.hasUndo = true;
    history.hasRedo = history.future.length > 0;

    AnalysisObj.redoFilter(next);
    draft.data = AnalysisObj.getData1d();
    setDomain(draft);
  });
};

const handleHistorySet = (historyDraft, newValue) => {
  if (newValue === historyDraft.present) return;

  if (historyDraft.present) {
    historyDraft.past.push(historyDraft.present);
  }
  historyDraft.present = newValue;
  historyDraft.future = [];
  historyDraft.hasUndo = true;
  historyDraft.hasRedo = false;
};

const handleHistoryReset = (state, action) => {
  return produce(state, (draft) => {
    draft.history = {
      past: [],
      present: action,
      future: [],
      hasRedo: false,
      hasUndo: false,
    };
  });
};

//////////////////////////////////////////////////////////////////////
//////////////// end undo and redo functions /////////////////////////
//////////////////////////////////////////////////////////////////////

export const spectrumReducer = (state, action) => {
  switch (action.type) {
    case INITIATE:
      return initiate(state, action.data);
    case LOAD_JSON_FILE:
      return handleLoadJsonFile(state, action.data);
    case LOAD_JCAMP_FILE:
      return loadJcampFile(state, action.files);
    case LOAD_MOL_FILE:
      return handleLoadMOLFile(state, action.files);

    case SAVE_DATA_AS_JSON:
      return saveDataAsJson(state);
    case PEAK_PICKING:
      return addPeak(state, action.mouseCoordinates);
    case DELETE_PEAK_NOTATION:
      return deletePeak(state, action.data);

    case ADD_INTEGRAL:
      return addIntegral(state, action.integral);

    case SET_ORIGINAL_DOMAIN:
      return setOriginalDomain(state, action.domain);

    case SET_X_DOMAIN:
      return setXDomain(state, action.xDomain);

    case SET_Y_DOMAIN:
      return setYDomain(state, action.yDomain);

    case SET_WIDTH:
      return setWidth(state, action.width);

    case SET_DIMENSIONS:
      return handleSetDimensions(state, action.width, action.height);

    case SET_POINTER_COORDINATES:
      return setPointerCoordinates(state, action.pointerCoordinates);

    case SET_SELECTED_TOOL:
      return setSelectedTool(state, action.selectedTool);

    case SET_DATA:
      return setData(state, action.data);

    case FULL_ZOOM_OUT:
      return zoomOut(state);

    case SHIFT_SPECTRUM:
      return shiftSpectrumAlongXAxis(state, action.shiftValue);

    case CHANGE_VISIBILITY:
      return handelSpectrumVisibility(state, action.data);

    case CHANGE_PEAKS_MARKERS_VISIBILITY:
      return handleChangePeaksMarkersVisibility(state, action.data);
    case CHNAGE_ACTIVE_SPECTRUM:
      return handelChangeActiveSpectrum(state, action.data);

    case CHNAGE_SPECTRUM_COLOR:
      return handelChangeSpectrumColor(state, action.data);
    case TOGGLE_REAL_IMAGINARY_VISIBILITY:
      return handleToggleRealImaginaryVisibility(state);
    case SET_ZOOM_FACTOR:
      return {
        ...state,
        zoomFactor: action.zoomFactor,
      };

    case CHANGE_SPECTRUM_DIPSLAY_VIEW_MODE:
      return handleChangeSpectrumDisplayMode(state);

    case ADD_MOLECULE:
      return handelAddMolecule(state, action.molfile);

    case SET_MOLECULE:
      return handeleSetMolecule(state, action.molfile, action.key);

    case DELETE_MOLECULE:
      return handeleDeleteMolecule(state, action.key);

    case DELETE_SPECTRA:
      return handelDeleteSpectra(state);

    // undo and redo operation
    case UNDO:
      return handleHistoryUndo(state);

    case REDO:
      return handleHistoryRedo(state);

    case RESET:
      return handleHistoryReset(state, action);

    default:
      return state;
  }
};
