import {
  INITIATE,
  SAVE_DATA_AS_JSON,
  PEAK_PICKING,
  DELETE_PEAK_NOTATION,
  SHIFT_SPECTRUM,
  LOADING_SPECTRUM,
  SET_DATA,
  SET_ORIGINAL_DOMAIN,
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_WIDTH,
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
  IMPORT_JSON,
} from './Actions';

import { UNDO, REDO, RESET } from './HistoryActions';
import { SHIFT_X } from '../../data/filter1d/filter1d-type';
import { MESSAGE_TYPE } from '../SnackBarContentWraper';

import * as d3 from 'd3';
import { Datum1D } from '../../data/Datum1D';
import { Data1DManager } from '../../data/Data1DManager';

import getKey from '../utility/KeyGenerator';
import getColor from '../utility/ColorGenerator';
import { Analysis } from '../../data/Analysis';

let AnalysisObj = new Analysis();

function getDomain(data) {
  let xArray = data.reduce(
    (acc, d) => acc.concat([d.x[0], d.x[d.x.length - 1]]),
    [],
  );
  let _yDomains = [];
  let yArray = data.reduce((acc, d, i) => {
    const extent = d3.extent(d.y);
    _yDomains[i] = extent;
    return acc.concat(extent);
  }, []);

  return { x: d3.extent(xArray), y: d3.extent(yArray), _yDomains: _yDomains };
}

const getScale = ({ _xDomain, _yDomain, _width, _height, _margin, _mode }) => {
  const xRange =
    _mode === 'RTL'
      ? [_width - _margin.right, _margin.left]
      : [_margin.left, _width - _margin.right];

  const x = d3.scaleLinear(_xDomain, xRange);
  const y = d3.scaleLinear(_yDomain, [_height - _margin.bottom, _margin.top]);
  return { x, y };
};

const initiate = (state, data) => {
  AnalysisObj = data.AnalysisObj;
  return state;
};

const importJson = (state, data) => {
  AnalysisObj = data.AnalysisObj;
  const _data = AnalysisObj.getData1d();

  const domain = getDomain(_data);

  return {
    ...state,
    _data,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _originDomain: domain,
    _yDomains: domain._yDomains,
  };

  // return state;
};

const saveDataAsJson = (state) => {
  const data = AnalysisObj.toJSON();

  try {
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
  } catch (e) {
    console.log(e);
  }

  return state;
};

const setData = (state, data) => {
  // AnalysisObj= new Analysis()
  for (let d of data) {
    AnalysisObj.pushDatum1D(new Datum1D(d));
  }
  const _data = AnalysisObj.getData1d();
  const domain = getDomain(_data);

  //change x axis from right to left or vice versa according to isFid value
  const v_mode = _data && _data[0] && _data[0].isFid ? 'LTR' : 'RTL';

  return {
    ...state,
    _data,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _originDomain: domain,
    _yDomains: domain._yDomains,
    _mode: v_mode,
  };
};

const loadSpectrum = (state, files) => {
  let usedColors = state._data.map((d) => d.color);

  const filesLength = files.length;
  if (filesLength >= 1 && files[0].extension.toLowerCase() !== '.json') {
    for (let i = 0; i < filesLength; i++) {
      // if (files[i].extension.toLowerCase() !== '.json') {
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
  }

  const _data = AnalysisObj.getData1d();

  const domain = getDomain(_data);

  return {
    ...state,
    _data,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _originDomain: domain,
    _yDomains: domain._yDomains,
  };
};

const getClosePeak = (xShift, mouseCoordinates, state) => {
  const scale = getScale(state);
  const { _data, _activeSpectrum, _mode } = state;
  const zoon = [
    scale.x.invert(mouseCoordinates.x - xShift),
    scale.x.invert(mouseCoordinates.x + xShift),
  ];

  //get the active sepectrum data by looking for it by id
  const selectedSpectrumData = _data.find((d) => d.id === _activeSpectrum.id);
  var maxIndex =
    selectedSpectrumData.x.findIndex(
      (number) => number >= zoon[_mode === 'RTL' ? 0 : 1],
    ) - 1;
  var minIndex = selectedSpectrumData.x.findIndex(
    (number) => number >= zoon[_mode === 'RTL' ? 1 : 0],
  );

  const selectedYData = selectedSpectrumData.y.slice(minIndex, maxIndex);

  const peakYValue = d3.max(selectedYData);
  const xIndex = selectedYData.findIndex((value) => value === peakYValue);
  const peakXValue = selectedSpectrumData.x[minIndex + xIndex];

  return { x: peakXValue, y: peakYValue, xIndex: minIndex + xIndex };
};

const addPeak = (state, mouseCoordinates) => {
  const _data = [...state._data];

  if (state._activeSpectrum) {
    const spectrumID = state._activeSpectrum.id;
    const index = _data.findIndex((d) => d.id === spectrumID);

    const peak = getClosePeak(10, mouseCoordinates, state);
    if (index !== -1) {
      if (_data[index].peaks) {
        _data[index].peaks.push({ xIndex: peak.xIndex });
      } else {
        _data[index].peaks = [{ xIndex: peak.xIndex }];
      }

      AnalysisObj.getDatum1D(spectrumID).setPeaks(_data[index].peaks);
    }
  } else {
    state.openMessage({
      messageType: MESSAGE_TYPE.error,
      messageText: 'you must select spectrum from the spectrum list',
    });
  }

  // return { ...state, _peakNotations: points };
  return { ...state, _data };
};

const deletePeak = (state, peakData) => {
  const _data = [...state._data];
  const spectrumID = state._activeSpectrum.id;
  const index = _data.findIndex((d) => d.id === spectrumID);
  _data[index].peaks = _data[index].peaks.filter(
    (p) => p.xIndex !== peakData.xIndex,
  );
  AnalysisObj.getDatum1D(spectrumID).setPeaks(_data[index].peaks);

  return { ...state, _data };
};

const addIntegral = (state, integralData) => {
  const _data = [...state._data];
  const integralID = integralData.id;
  const index = _data.findIndex((d) => d.id === integralID);
  delete integralData.id;

  if (index !== -1) {
    if (_data[index].integrals) {
      _data[index].integrals.push(integralData);
    } else {
      _data[index].integrals = [integralData];
    }

    AnalysisObj.getDatum1D(integralID).setIntegrals(_data[index].integrals);
  }
  return { ...state, _data };
};

const shiftSpectrumAlongXAxis = (state, shiftValue) => {
  const filterOption = {
    kind: SHIFT_X,
    value: shiftValue,
  };
  const activeSpectrumId = state._activeSpectrum.id;
  const activeObject = AnalysisObj.getDatum1D(activeSpectrumId);

  //apply filter into the spectrum
  activeObject.addFilter(filterOption);

  filterOption.id = activeSpectrumId;
  //add the filter action at the history
  const history = handleHistorySet(state.history, filterOption);

  console.log(history);

  activeObject.applyShiftXFilter(shiftValue);
  //add to undo history

  const XYData = activeObject.getReal();
  let data = [...state._data];
  const spectrumIndex = data.findIndex(
    (spectrum) => spectrum.id === activeSpectrumId,
  );

  data[spectrumIndex] = { ...data[spectrumIndex], x: XYData.x, y: XYData.y };

  console.log(data[spectrumIndex]);
  console.log(data);

  const domain = getDomain(data);

  return {
    ...state,
    _data: data,
    _xDomain:
      state._originDomain.x[0] === state._xDomain[0] &&
      state._originDomain.x[1] === state._xDomain[1]
        ? domain.x
        : state._xDomain,
    _yDomain: domain.y,
    _originDomain: domain,
    history,
  };
};

const setOriginalDomain = (state, _originDomain) => {
  return { ...state, _originDomain };
};

const setXDomain = (state, _xDomain) => {
  return { ...state, _xDomain };
};

const setYDomain = (state, _yDomain) => {
  if (state._activeSpectrum === null) {
    const _yDomains = state._yDomains.map((y) => {
      return [y[0] + (_yDomain[0] - y[0]), y[1] + (_yDomain[1] - y[1])];
    });

    return { ...state, _yDomain, _yDomains };
  } else {
    const index = state._data.findIndex(
      (d) => d.id === state._activeSpectrum.id,
    );
    const yDomains = [...state._yDomains];
    yDomains[index] = _yDomain;
    return { ...state, _yDomains: yDomains };
  }
};

const setWidth = (state, _width) => {
  return { ...state, _width };
};

const setPointerCoordinates = (state, _pointerCoordinates) => {
  return { ...state, _pointerCoordinates };
};

const setSelectedTool = (state, _selectedTool) => {
  return { ...state, _selectedTool };
};

const zoomOut = (state) => {
  return {
    ...state,
    _xDomain: state._originDomain.x,
    _yDomain: state._originDomain.y,
  };
};

const handelSpectrumVisibility = (state, data) => {
  const newData = [...state._data];
  const v_data = newData.map((d, i) => {
    const result = data.findIndex((sData) => sData.id === d.id);
    if (result !== -1) {
      AnalysisObj.getDatum1D(d.id).isVisible = true;
      return { ...d, isVisible: true };
    } else {
      AnalysisObj.getDatum1D(d.id).isVisible = false;
      return { ...d, isVisible: false };
    }
  });

  return { ...state, _data: v_data };
};

const handleChangePeaksMarkersVisibility = (state, data) => {
  const newData = [...state._data];
  const result = newData.map((d, i) => {
    const result = data.findIndex((activeData) => activeData.id === d.id);
    if (result !== -1) {
      AnalysisObj.getDatum1D(d.id).isPeaksMarkersVisible = true;
      return { ...d, isPeaksMarkersVisible: true };
    } else {
      AnalysisObj.getDatum1D(d.id).isPeaksMarkersVisible = false;
      return { ...d, isPeaksMarkersVisible: false };
    }
  });

  return { ...state, _data: result };
};

const handelChangeActiveSpectrum = (state, activeSpectrum) => {
  const data = [...state._data];
  if (activeSpectrum) {
    AnalysisObj.getDatum1D(activeSpectrum.id).isVisible = true;
    const index = data.findIndex((d) => d.id === activeSpectrum.id);
    if (index !== -1) {
      data[index].isVisible = true;
    }
  }
  return { ...state, _data: data, _activeSpectrum: activeSpectrum };
};

const handelChangeSpectrumColor = (state, { id, color }) => {
  const data = [...state._data];
  const index = data.findIndex((d) => d.id === id);
  if (index !== -1) {
    data[index].color = color;
    AnalysisObj.getDatum1D(id).color = true;
  }

  return { ...state, _data: data };
};

const handleToggleRealImaginaryVisibility = (state, isRealSpectrumVisible) => {
  if (state._activeSpectrum !== null) {
    const activeSpectrumId = state._activeSpectrum.id;
    const ob = AnalysisObj.getDatum1D(activeSpectrumId);

    if (ob) {
      const v_data = [...state._data];

      const reY = ob.getReal().y;
      const imY = ob.getImaginary().y;
      const index = state._data.findIndex((d) => d.id === activeSpectrumId);
      ob.setIsRealSpectrumVisible(!v_data[index]);

      v_data[index].isRealSpectrumVisible = !v_data[index]
        .isRealSpectrumVisible;
      ob.setIsRealSpectrumVisible();
      // isRealSpectrumVisible
      if (v_data[index].isRealSpectrumVisible) {
        if (reY !== null && reY !== undefined) {
          v_data[index].y = reY;
          const domain = getDomain(v_data);

          return {
            ...state,
            _xDomain: domain.x,
            _yDomain: domain.y,
            _yDomains: domain._yDomains,
            _data: v_data,
          };
        } else {
          return state;
        }
      } else {
        if (imY !== null && imY !== undefined) {
          v_data[index].y = imY;
          const domain = getDomain(v_data);

          return {
            ...state,
            _xDomain: domain.x,
            _yDomain: domain.y,
            _yDomains: domain._yDomains,
            _data: v_data,
          };
        } else {
          return state;
        }
      }
    }
  } else {
    return state;
  }
};

//////////////////////////////////////////////////////////////////////
//////////////// start undo and redo functions ///////////////////////
//////////////////////////////////////////////////////////////////////

const handleHistoryUndo = (state) => {
  const { past, present, future } = state.history;
  const previous = past[past.length - 1];
  console.log(present);
  const newPast = past.slice(0, past.length - 1);
  const newfuture = [present, ...future];

  const hasRedo = newfuture.length !== 0;
  const hasUndo = past.length !== 0;

  AnalysisObj.undoFilter(past);
  let resultData = AnalysisObj.getData1d();

  const domain = getDomain(resultData);
  const v_history = {
    past: newPast,
    present: previous,
    future: newfuture,
    hasRedo,
    hasUndo,
  };

  return {
    ...state,
    _data: resultData,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _originDomain: domain,
    history: v_history,
  };
};

const handleHistoryRedo = (state) => {
  const { past, present, future } = state.history;
  const next = future.length === 0 ? null : future[0];
  const newFuture = future.slice(1);
  const newPast =
    present !== null && present !== undefined ? [...past, present] : past;

  const check = next !== null && next !== undefined ? [...past, present] : past;

  const hasUndo = check !== 0;
  const hasRedo = newFuture.length !== 0;

  AnalysisObj.redoFilter(next);
  let data = AnalysisObj.getData1d();
  const domain = getDomain(data);
  const v_history = {
    past: newPast,
    present: next,
    future: newFuture,
    hasRedo,
    hasUndo,
  };

  return {
    ...state,
    _data: data,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _originDomain: domain,
    history: v_history,
  };
};

const handleHistorySet = (state, action) => {
  console.log(state);
  const newValue = action;

  const { past, present } = state;

  if (newValue === present) {
    return state;
  }

  return {
    past:
      present !== null && present !== undefined
        ? [...past, present]
        : [...past],
    present: newValue,
    future: [],
    hasUndo: true,
    hasRedo: false,
  };
};

const handleHistoryReset = (state, action) => {
  const newValue = action;
  return {
    ...state,
    history: {
      past: [],
      present: newValue,
      future: [],
      hasRedo: false,
      hasUndo: false,
    },
  };
};

//////////////////////////////////////////////////////////////////////
//////////////// end undo and redo functions /////////////////////////
//////////////////////////////////////////////////////////////////////

export const spectrumReducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case INITIATE:
      return initiate(state, action.data);

    case IMPORT_JSON:
      return importJson(state, action.data);

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

    case SET_POINTER_COORDINATES:
      return setPointerCoordinates(state, action.pointerCoordinates);

    case SET_SELECTED_TOOL:
      return setSelectedTool(state, action.selectedTool);

    case SET_DATA:
      return setData(state, action.data);

    case FULL_ZOOM_OUT:
      return zoomOut(state);

    case LOADING_SPECTRUM:
      return loadSpectrum(state, action.files);

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
      return handleToggleRealImaginaryVisibility(
        state,
        action.isRealSpectrumVisible,
      );
    case SET_ZOOM_FACTOR:
      return {
        ...state,
        _zoomFactor: action.zoomFactor,
      };

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
