import { produce, original } from 'immer';
import * as d3 from 'd3';
import { XY } from 'ml-spectra-processing';

import { Datum1D } from '../../data/data1d/Datum1D';
import { Data1DManager } from '../../data/data1d/Data1DManager';
import getColor from '../utility/ColorGenerator';
import { Analysis } from '../../data/Analysis';
import { options } from '../toolbar/FunctionToolBar';
import { Filters } from '../../data/data1d/filter1d/Filters';

import { UNDO, REDO, RESET } from './HistoryActions';
import {
  INITIATE,
  SAVE_DATA_AS_JSON,
  ADD_PEAK,
  ADD_PEAKS,
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
  CHANGE_ACTIVE_SPECTRUM,
  CHANGE_SPECTRUM_COLOR,
  ADD_INTEGRAL,
  DELETE_INTEGRAL,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
  SET_ZOOM_FACTOR,
  ADD_MOLECULE,
  SET_MOLECULE,
  DELETE_MOLECULE,
  DELETE_SPECTRA,
  CHANGE_SPECTRUM_DIPSLAY_VIEW_MODE,
  SET_INTEGRAL_Y_DOMAIN,
  RESIZE_INTEGRAL,
  BRUSH_END,
  RESET_DOMAIN,
  CHNAGE_INTEGRAL_ZOOM,
  ENABLE_FILTER,
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
  return produce(state, (draft) => {
    AnalysisObj = data.AnalysisObj;
    const spectraData = AnalysisObj.getData1d();
    const domain = getDomain(spectraData);
    draft.data = AnalysisObj.getData1d();
    draft.molecules = AnalysisObj.getMolecules();
    draft.xDomain = domain.x;
    draft.yDomain = domain.y;
    draft.originDomain = domain;
    draft.yDomains = domain.yDomains;
    setMode(draft);
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
  const { activeSpectrum } = state;
  const start = scale.x.invert(mouseCoordinates.x - xShift);
  const end = scale.x.invert(mouseCoordinates.x + xShift);
  const zoon = [];
  if (start > end) {
    zoon[0] = end;
    zoon[1] = start;
  } else {
    zoon[0] = start;
    zoon[1] = end;
  }
  // const zoon = [
  //   scale.x.invert(mouseCoordinates.x - xShift),
  //   scale.x.invert(mouseCoordinates.x + xShift),
  // ];

  const closePeak = AnalysisObj.getDatum1D(activeSpectrum.id).lookupPeak(
    zoon[0],
    zoon[1],
  );
  return closePeak;
};

const addPeak = (state, mouseCoordinates) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const spectrumID = state.activeSpectrum.id;

      const index = state.data.findIndex((d) => d.id === spectrumID);
      const candidatePeak = getClosePeak(10, mouseCoordinates, state);

      if (index !== -1) {
        const peak = { xIndex: candidatePeak.xIndex };
        if (state.data[index].peaks) {
          draft.data[index].peaks.push(peak);
        } else {
          draft.data[index].peaks = [peak];
        }
        // draft.data[index].peaks
        AnalysisObj.getDatum1D(spectrumID).addPeak(peak);
      }
    }
  });
};

const addPeaks = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const spectrumID = state.activeSpectrum.id;
      const index = state.data.findIndex((d) => d.id === spectrumID);

      const scale = getScale(state);

      const start = scale.x.invert(action.startX);
      const end = scale.x.invert(action.endX);
      const range = [];
      if (start > end) {
        range[0] = end;
        range[1] = start;
      } else {
        range[0] = start;
        range[1] = end;
      }

      if (index !== -1) {
        const peaks = AnalysisObj.getDatum1D(spectrumID).addPeaks(
          range[0],
          range[1],
        );
        draft.data[index].peaks = peaks;
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

const addIntegral = (state, action) => {
  const scale = getScale(state).x;

  return produce(state, (draft) => {
    const start = scale.invert(action.startX);
    const end = scale.invert(action.endX);

    let integralRange;
    if (start > end) {
      integralRange = [end, start];
    } else {
      integralRange = [start, end];
    }

    if (draft.activeSpectrum) {
      const index = state.data.findIndex(
        (d) => d.id === state.activeSpectrum.id,
      );

      const data = state.data[index];

      const integralResult = XY.integral(data, {
        from: integralRange[0],
        to: integralRange[1],
        reverse: true,
      });

      const integralValue = XY.integration(data, {
        from: integralRange[0],
        to: integralRange[1],
        reverse: true,
      });

      const integral = {
        from: integralRange[0],
        to: integralRange[1],
        ...integralResult,
        value: integralValue,
        id:
          state.activeSpectrum.id +
          Math.random()
            .toString(36)
            .replace('0.', ''),
      };

      if (index !== -1) {
        let integrals = Object.assign(
          [],
          original(draft.data[index].integrals),
        );
        if (data.integrals) {
          integrals.push(integral);
        } else {
          integrals = [integral];
        }
        draft.data[index].integrals = integrals;
        if (!data.integralsYDomain) {
          draft.data[index].integralsYDomain = draft.yDomain;
        }
        AnalysisObj.getDatum1D(state.activeSpectrum.id).setIntegrals(integrals);
      }
    }
  });
};

const deleteIntegral = (state, action) => {
  const { integralID, spectrumID } = action;
  return produce(state, (draft) => {
    const index = state.data.findIndex((d) => d.id === spectrumID);
    draft.data[index].integrals = state.data[index].integrals.filter(
      (integral) => integral.id !== integralID,
    );
  });
};

const handleResizeIntegral = (state, integralData) => {
  return produce(state, (draft) => {
    if (draft.activeSpectrum) {
      const index = state.data.findIndex(
        (d) => d.id === state.activeSpectrum.id,
      );

      const data = state.data[index];

      const integralResult = XY.integral(data, {
        from: integralData.from,
        to: integralData.to,
        reverse: true,
      });

      const integralValue = XY.integration(data, {
        from: integralData.from,
        to: integralData.to,
        reverse: true,
      });

      const integral = {
        ...integralData,
        ...integralResult,
        value: integralValue,
      };

      if (index !== -1) {
        if (data.integrals) {
          const integralIndex = data.integrals.findIndex(
            (i) => i.id === integralData.id,
          );
          draft.data[index].integrals[integralIndex] = {
            ...state.data[index].integrals[integralIndex],
            ...integral,
          };

          AnalysisObj.getDatum1D(state.activeSpectrum.id).setIntegrals(
            draft.data[index].integrals[integralIndex],
          );
        }
      }
    }
  });
};

const shiftSpectrumAlongXAxis = (state, shiftValue) => {
  return produce(state, (draft) => {
    const filterOption = {
      kind: Filters.shiftX.name,
      value: shiftValue,
    };
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum1D(activeSpectrumId);

    //apply filter into the spectrum
    activeObject.addFilter(filterOption);

    filterOption.id = activeSpectrumId;
    //add the filter action at the history
    // const history = handleHistorySet(state.history, filterOption);
    // console.log(history);

    activeObject.applyShiftXFilter(shiftValue);
    //add to undo history

    const XYData = activeObject.getReal();
    const spectrumIndex = draft.data.findIndex(
      (spectrum) => spectrum.id === activeSpectrumId,
    );

    draft.data[spectrumIndex].x = XYData.x;
    draft.data[spectrumIndex].y = XYData.y;
    // draft.history = history;
    draft.data[spectrumIndex].filters = activeObject.getFilters();
    setDomain(draft);
  });
};

const enableFilter = (state, filterID, checked) => {
  return produce(state, (draft) => {
    const activeSpectrumId = state.activeSpectrum.id;
    const activeObject = AnalysisObj.getDatum1D(activeSpectrumId);

    //apply filter into the spectrum
    activeObject.enableFilter(filterID, checked);

    const XYData = activeObject.getReal();

    const spectrumIndex = state.data.findIndex(
      (spectrum) => spectrum.id === activeSpectrumId,
    );

    draft.data[spectrumIndex].x = XYData.x;
    draft.data[spectrumIndex].y = XYData.y;
    draft.data[spectrumIndex].filters = activeObject.getFilters();
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
const handleSpectrumVisibility = (state, data) => {
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

const handleChangeActiveSpectrum = (state, activeSpectrum) => {
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

const handleChangeSpectrumColor = (state, { id, color }) => {
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

const getClosestNumber = (array = [], goal = 0) => {
  const closest = array.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
  return closest;
};

const handleZoom = (state, zoomFactor) => {
  console.log(zoomFactor);
  return produce(state, (draft) => {
    const {
      originDomain,
      height,
      margin,
      data,
      yDomains,
      activeSpectrum,
    } = state;

    const scale = d3.scaleLinear(originDomain.y, [
      height - margin.bottom,
      margin.top,
    ]);
    let t;
    if (data.length === 1) {
      const closest = getClosestNumber(data[0].y);
      const referencePoint = getScale(state).y(closest);
      t = d3.zoomIdentity
        .translate(0, referencePoint)
        .scale(zoomFactor.scale)
        .translate(0, -referencePoint);
    } else {
      t = d3.zoomIdentity
        .translate(0, height - margin.bottom)
        .scale(zoomFactor.scale)
        .translate(0, -(height - margin.bottom));
    }

    draft.zoomFactor = t;

    let yDomain = t.rescaleY(scale).domain();

    if (activeSpectrum === null) {
      const _yDomains = yDomains.map((y) => {
        return [y[0] + (yDomain[0] - y[0]), y[1] + (yDomain[1] - y[1])];
      });

      draft.yDomains = _yDomains;

      // return { ...state, yDomain, yDomains };
    } else {
      const index = data.findIndex((d) => d.id === activeSpectrum.id);
      const yDomains = [...state.yDomains];
      yDomains[index] = yDomain;

      draft.yDomains = yDomains;

      // return { ...state, yDomains: yDomains };
    }

    console.log(yDomains);
  });
};

const handleAddMolecule = (state, molfile) => {
  AnalysisObj.addMolfile(molfile);
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.getMolecules();
  });
};

const handleSetMolecule = (state, molfile, key) => {
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.setMolfile(molfile, key);
  });
};

const handleDeleteMolecule = (state, key) => {
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
  draft.yDomain = domain.y;
  draft.originDomain = domain;
  draft.yDomains = domain.yDomains;
  draft.data = draft.data.map((d) => {
    return { ...d, integralsYDomain: domain.y };
  });
}

const handleDeleteSpectra = (state) => {
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

const handleChangeIntegralYDomain = (state, newYDomain) => {
  return produce(state, (draft) => {
    const activeSpectrum = draft.activeSpectrum;
    if (activeSpectrum) {
      const spectrumIndex = draft.data.findIndex(
        (s) => s.id === activeSpectrum.id,
      );
      draft.data[spectrumIndex].integralsYDomain = newYDomain;
    }
  });
};
const handleChangeIntegralZoom = (state, zoomFactor) => {
  return produce(state, (draft) => {
    const { originDomain, height, margin } = state;
    const scale = d3.scaleLinear(originDomain.y, [
      height - margin.bottom,
      margin.top,
    ]);

    const t = d3.zoomIdentity
      .translate(0, height - margin.bottom)
      .scale(zoomFactor.scale * 10)
      .translate(0, -(height - margin.bottom));

    const newYDomain = t.rescaleY(scale).domain();

    const activeSpectrum = draft.activeSpectrum;
    if (activeSpectrum) {
      const spectrumIndex = draft.data.findIndex(
        (s) => s.id === activeSpectrum.id,
      );
      draft.zoomFactor = t;
      draft.data[spectrumIndex].integralsYDomain = newYDomain;
    }
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
  return historyDraft;
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

const handleBrushEnd = (state, action) => {
  const scale = getScale(state).x;
  return produce(state, (draft) => {
    const start = scale.invert(action.startX);
    const end = scale.invert(action.endX);
    if (start > end) {
      draft.xDomain = [end, start];
    } else {
      draft.xDomain = [start, end];
    }
  });
};

const handelResetDomain = (state) => {
  return produce(state, (draft) => {
    draft.xDomain = state.originDomain.x;
    draft.yDomain = state.originDomain.y;
  });
};

//////////////////////////////////////////////////////////////////////
//////////////// end undo and redo functions /////////////////////////
//////////////////////////////////////////////////////////////////////

export const initialState = {
  data: null,
  xDomain: [],
  yDomain: [],
  yDomains: [],
  originDomain: {},
  selectedTool: options.zoom.id,
  // peakNotations: [],
  width: null,
  height: null,
  margin: {
    top: 10,
    right: 20,
    bottom: 30,
    left: 0,
  },
  activeSpectrum: null,
  mode: 'RTL',
  zoomFactor: null,
  molecules: [],
  verticalAlign: 0,
  history: {
    past: [],
    present: null,
    future: [],
    hasUndo: false,
    hasRedo: false,
  },
};

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
    case ADD_PEAK:
      return addPeak(state, action.mouseCoordinates);
    case ADD_PEAKS:
      return addPeaks(state, action);

    case DELETE_PEAK_NOTATION:
      return deletePeak(state, action.data);

    case ADD_INTEGRAL:
      return addIntegral(state, action);
    case DELETE_INTEGRAL:
      return deleteIntegral(state, action);

    case RESIZE_INTEGRAL:
      return handleResizeIntegral(state, action.integral);

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
    case ENABLE_FILTER:
      return enableFilter(state, action.id, action.checked);
    case CHANGE_VISIBILITY:
      return handleSpectrumVisibility(state, action.data);

    case CHANGE_PEAKS_MARKERS_VISIBILITY:
      return handleChangePeaksMarkersVisibility(state, action.data);
    case CHANGE_ACTIVE_SPECTRUM:
      return handleChangeActiveSpectrum(state, action.data);

    case CHANGE_SPECTRUM_COLOR:
      return handleChangeSpectrumColor(state, action.data);
    case TOGGLE_REAL_IMAGINARY_VISIBILITY:
      return handleToggleRealImaginaryVisibility(state);
    case SET_ZOOM_FACTOR:
      return handleZoom(state, action.zoomFactor);
    // return {
    //   ...state,
    //   zoomFactor: action.zoomFactor,
    // };

    case CHANGE_SPECTRUM_DIPSLAY_VIEW_MODE:
      return handleChangeSpectrumDisplayMode(state);

    case ADD_MOLECULE:
      return handleAddMolecule(state, action.molfile);

    case SET_MOLECULE:
      return handleSetMolecule(state, action.molfile, action.key);

    case DELETE_MOLECULE:
      return handleDeleteMolecule(state, action.key);

    case DELETE_SPECTRA:
      return handleDeleteSpectra(state);

    case SET_INTEGRAL_Y_DOMAIN:
      return handleChangeIntegralYDomain(state, action.yDomain);

    case CHNAGE_INTEGRAL_ZOOM:
      return handleChangeIntegralZoom(state, action.zoomFactor);

    case BRUSH_END:
      return handleBrushEnd(state, action);

    case RESET_DOMAIN:
      return handelResetDomain(state);
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
