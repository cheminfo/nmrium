import {
  PEAK_PICKING,
  SHIFT_SPECTRUM,
  LOADING_SPECTRUM,
  SET_DATA,
  SET_ORGINAL_DOMAIN,
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_WIDTH,
  SET_POINTER_COORDINATES,
  SET_SELECTED_TOOL,
  CHANGE_SPECTRUM_TYPE,
  FULL_ZOOM_OUT,
  CHANGE_VISIBILITY,
  CHNAGE_ACTIVE_SPECTRUM,
} from './action';

import { UNDO, REDO, RESET } from './undo-action';

import { SHIFT_X } from '../../data/filter1d/filter1d-type';
import { MESSAGE_TYPE } from '../snack-bar-content-wraper';

// { width, height, margin, data, xDomain, yDomain, getScale }

// import applyFilter from '../../data/filter1d/filter';

import * as d3 from 'd3';
import { Datum1D } from '../../data/Datum1D';

import getKey from '../utility/key-generartor';
import getColor from '../utility/color-generator';

// let datum1DObjects = [];

function getDomain(data) {
  let xArray = data.reduce(
    (acc, d) => acc.concat([d.x[0], d.x[d.x.length - 1]]),
    [],
  );
  let yArray = data.reduce((acc, d) => acc.concat(d3.extent(d.y)), []);
  return { x: d3.extent(xArray), y: d3.extent(yArray) };
}

const getScale = ({ _xDomain, _yDomain, _width, _height, _margin }) => {
  const x = d3.scaleLinear(_xDomain, [_width - _margin.right, _margin.left]);
  const y = d3.scaleLinear(_yDomain, [_height - _margin.bottom, _margin.top]);
  return { x, y };
};

const setData = (state, data) => {
  const domain = getDomain(data);
  for (let d of data) {
    Datum1D.pushObject(
      new Datum1D(d.id, d.x, d.y, d.y, d.name, d.color, d.isVisible),
    );
  }

  // let dataumObject =
  // Datum1D.setObject(new Datum1D(data.x, data.y, data.y));
  // const XYData = dataumObject.getReal();
  // const v_data = { ...state._data };
  // v_data.x = dataumObject.x;
  // v_data.y = dataumObject.im;

  return {
    ...state,
    _peakNotations: [],
    _data: data,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _orignDomain: domain,
  };
};
const loadSpectrum = (state, file) => {
  const key = getKey();
  const color = getColor();

  let dataumObject = Datum1D.fromJcamp(
    key,
    file.binary.toString(),
    file.name,
    color,
    true,
  );

  Datum1D.pushObject(dataumObject);

  const xyData = Datum1D.getXYData();
  // const v_data = [...state._data];

  const domain = getDomain(xyData);
  // const realData = dataumObject.getReal();

  // v_data.push({
  //   x: realData.x,
  //   y: realData.im,
  //   name: file.name,
  //   color: key,
  //   id: color,
  //   isVisible: true,
  // });

  return {
    ...state,
    _peakNotations: [],
    _data: xyData,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _orignDomain: domain,
  };
};

const getClosePeak = (xShift, mouseCorrdinates, state) => {
  const scale = getScale(state);
  const { _data, _activeSpectrum } = state;
  const zoon = [
    scale.x.invert(mouseCorrdinates.x - xShift),
    scale.x.invert(mouseCorrdinates.x + xShift),
  ];

  //get the active sepectrum data by looking for it by id
  const selectedSpectrumData = _data.find((d) => d.id === _activeSpectrum.id);
  var maxIndex =
    selectedSpectrumData.x.findIndex((number) => number >= zoon[0]) - 1;
  var minIndex = selectedSpectrumData.x.findIndex(
    (number) => number >= zoon[1],
  );

  const selctedYData = selectedSpectrumData.y.slice(minIndex, maxIndex);

  const peakYValue = d3.max(selctedYData);
  const xIndex = selctedYData.findIndex((value) => value === peakYValue);
  const peakXValue = selectedSpectrumData.x[minIndex + xIndex];

  return { x: peakXValue, y: peakYValue, xIndex: minIndex + xIndex };
};

const addPeak = (state, mouseCorrdinates) => {
  const points = [...state._peakNotations];

  if (state._activeSpectrum) {
    const id = state._activeSpectrum.id;
    const peak = getClosePeak(10, mouseCorrdinates, state);
    // if (points.findIndex((point) => point.xIndex === peak.xIndex) === -1) {
    if (points[id]) {
      points[id].push({ xIndex: peak.xIndex });
    } else {
      points[id] = [{ xIndex: peak.xIndex }];
    }
    // }
  } else {
    state.openMessage({
      messageType: MESSAGE_TYPE.error,
      messageText: 'you must select spectrum from the spectrum list',
    });
  }

  return { ...state, _peakNotations: points };
};

const shiftSpectrumAlongXAxis = (state, shiftValue) => {
  const filterOption = {
    kind: SHIFT_X,
    value: shiftValue,
  };
  const activeSpectrumId = state._activeSpectrum.id;
  const activeObject = Datum1D.getObject(activeSpectrumId);

  //appy filiter into the spectrum
  activeObject.addFilter(filterOption);

  filterOption.id = activeSpectrumId;
  //add the filiter action at the history
  const history = handleHistorySet(state.history, filterOption);

  activeObject.applyShiftXFiliter(shiftValue);
  //add to undo history

  const XYData = activeObject.getReal();
  let data = [...state._data];
  const spectrumIndex = data.findIndex(
    (spectrum) => spectrum.id === activeSpectrumId,
  );

  data[spectrumIndex] = { ...data[spectrumIndex], x: XYData.x, y: XYData.y };

  const domain = getDomain(data);

  return {
    ...state,
    _data: data,
    _xDomain:
      state._orignDomain.x[0] === state._xDomain[0] &&
      state._orignDomain.x[1] === state._xDomain[1]
        ? domain.x
        : state._xDomain,
    _yDomain: domain.y,
    _orignDomain: domain,
    history,
  };
};

const setOrginalDomain = (state, _orignDomain) => {
  return { ...state, _orignDomain };
};

const setXDomain = (state, _xDomain) => {
  return { ...state, _xDomain };
};

const setYDomain = (state, _yDomain) => {
  return { ...state, _yDomain };
};

const setWidth = (state, _width) => {
  return { ...state, _width };
};

const setPointerCoordinates = (state, _pointerCorrdinates) => {
  return { ...state, _pointerCorrdinates };
};

const setSelectedTool = (state, _selectedTool) => {
  return { ...state, _selectedTool };
};

const zoomOut = (state) => {
  return {
    ...state,
    _xDomain: state._orignDomain.x,
    _yDomain: state._orignDomain.y,
  };
};

const handelSpectrumVisibility = (state, data) => {
  const newData = [...state._data];
  const rdata = newData.map((d, i) => {
    const result = data.findIndex((newd) => newd.id == d.id);
    if (result !== -1) {
      Datum1D.getObject(d.id).isVisible = true;
      return { ...d, isVisible: true };
    } else {
      Datum1D.getObject(d.id).isVisible = false;
      return { ...d, isVisible: false };
    }
    // return result !== undefined
    //   ? { ...d, isVisible: true }
    //   : { ...d, isVisible: false };
  });

  return { ...state, _data: rdata };
};

const handelChangeActiveSpectrum = (state, activeSpectrum) => {
  const data = [...state._data];
  if (activeSpectrum) {
    Datum1D.getObject(activeSpectrum.id).isVisible = true;
    const index = data.findIndex((d) => d.id === activeSpectrum.id);
    if (index !== -1) {
      data[index].isVisible = true;
    }
  }
  return { ...state, _data: data, _activeSpectrum: activeSpectrum };
};

const changeSpectrumType = (state, isRealSpectrumVisible) => {
  if (state._activeSpectrum != null) {
    const activeSpectrumId = state._activeSpectrum.id;
    const ob = Datum1D.getObject(activeSpectrumId);

    if (ob) {
      const v_data = [...state._data];

      const reY = ob.getReal().y;
      const imY = ob.getImaginary().y;
      const index = state._data.findIndex((d) => d.id == activeSpectrumId);

      if (isRealSpectrumVisible) {
        if (reY != null && reY != undefined) {
          v_data[index].y = reY;

          return {
            ...state,
            _data: v_data,
          };
        } else {
          return state;
        }
      } else {
        if (imY != null && imY != undefined) {
          v_data[index].y = imY;

          return {
            ...state,
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

  // return state;
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

  Datum1D.undoFilter(past);
  let resultData = Datum1D.getXYData();

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
    _orignDomain: domain,
    history: v_history,
  };
};

const handleHistoryRedo = (state) => {
  const { past, present, future } = state.history;
  const next = future[0];
  const newFuture = future.slice(1);
  const newPast = present != undefined ? [...past, present] : past;

  const hasUndo = present == undefined || newPast.length !== 0 ? true : false;
  const hasRedo = newFuture.length !== 0;

  Datum1D.redoFilter(next);
  let data = Datum1D.getXYData();
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
    _orignDomain: domain,
    history: v_history,
  };
};

const handleHistorySet = (state, action) => {
  const newValue = action;

  const { past, present } = state;

  if (newValue === present) {
    return state;
  }

  return {
    past: present != null ? [...past, present] : [...past],
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
  switch (action.type) {
    case PEAK_PICKING:
      return addPeak(state, action.mouseCorrdinates);
    case SET_ORGINAL_DOMAIN:
      return setOrginalDomain(state, action.domain);

    case SET_X_DOMAIN:
      return setXDomain(state, action.xDomain);

    case SET_Y_DOMAIN:
      return setYDomain(state, action.yDomain);

    case SET_WIDTH:
      return setWidth(state, action.width);

    case SET_POINTER_COORDINATES:
      return setPointerCoordinates(state, action.pointerCorrdinates);

    case SET_SELECTED_TOOL:
      return setSelectedTool(state, action.selectedTool);

    case SET_DATA:
      return setData(state, action.data);

    case FULL_ZOOM_OUT:
      return zoomOut(state);

    case LOADING_SPECTRUM:
      return loadSpectrum(state, action);

    case SHIFT_SPECTRUM:
      return shiftSpectrumAlongXAxis(state, action.shiftValue);

    case CHANGE_SPECTRUM_TYPE:
      return changeSpectrumType(state, action.isRealSpectrumVisible);

    case CHANGE_VISIBILITY:
      return handelSpectrumVisibility(state, action.data);
    case CHNAGE_ACTIVE_SPECTRUM:
      return handelChangeActiveSpectrum(state, action.data);

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
