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
} from './action';

import { shiftX } from '../../data/filter1d/filter1d-type';
import * as d3 from 'd3';
import { Datum1D } from '../../data/Datum1D';

let dataumObject = null;

function getDomain(data) {
  return { x: [data.x[0], data.x[data.x.length - 1]], y: d3.extent(data.y) };
}

const getScale = ({ _xDomain, _yDomain, _width, _height, _margin }) => {
  const x = d3.scaleLinear(_xDomain, [_width - _margin.right, _margin.left]);
  const y = d3.scaleLinear(_yDomain, [_height - _margin.bottom, _margin.top]);
  return { x, y };
};

const setData = (state, data) => {
  const domain = getDomain(data);
  dataumObject = new Datum1D(data.x, data.y, data.y);
  const v_data = { ...state._data };
  v_data.x = dataumObject.x;
  v_data.y = dataumObject.im;

  return {
    ...state,
    _peakNotations: [],
    _data: v_data,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _orignDomain: domain,
  };
};
const loadSpectrum = (state, binaryData) => {
  dataumObject = Datum1D.fromJcamp(binaryData.toString());
  const realData = dataumObject.getReal();
  const domain = getDomain({ x: realData.x, y: realData.y });
  const v_data = { ...state._data };
  v_data.x = dataumObject.x;
  v_data.y = dataumObject.im;
  return {
    ...state,
    _peakNotations: [],
    _data: v_data,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _orignDomain: domain,
  };
};

const getClosePeak = (xShift, state) => {
  const scale = getScale(state);
  const { _pointerCorrdinates, _data } = state;
  const zoon = [
    scale.x.invert(_pointerCorrdinates.x - xShift),
    scale.x.invert(_pointerCorrdinates.x + xShift),
  ];

  var maxIndex = _data.x.findIndex((number) => number >= zoon[0]) - 1;
  var minIndex = _data.x.findIndex((number) => number >= zoon[1]);

  const selctedYData = _data.y.slice(minIndex, maxIndex);

  const peakYValue = d3.max(selctedYData);
  const xIndex = selctedYData.findIndex((value) => value === peakYValue);
  const peakXValue = _data.x[minIndex + xIndex];

  return { x: peakXValue, y: peakYValue, xIndex: minIndex + xIndex };
};

const addPeak = (state) => {
  const peak = getClosePeak(10, state);
  const points = [...state._peakNotations];

  if (points.findIndex((point) => point.xIndex === peak.xIndex) === -1) {
    points.push({ xIndex: peak.xIndex });
  }

  return { ...state, _peakNotations: points };
};

const shiftSpectrumAlongXAxis = (state, shiftValue) => {
  const data = { ...state._data };
  data.x = data.x.map((val) => val + shiftValue);
  const domain = getDomain({ x: data.x, y: data.y });
  return {
    ...state,
    _data: data,
    _xDomain: domain.x,
    _yDomain: domain.y,
    _orignDomain: domain,
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

const changeSpectrumType = (state, isRealSpectrumVisible) => {
  if (dataumObject) {
    const reY = dataumObject.getReal().y;
    const imY = dataumObject.getImaginary().y;

    if (isRealSpectrumVisible) {
      if (reY != null && reY != undefined) {
        return {
          ...state,
          _data: { ...state._data, y: reY },
        };
      } else {
        return state;
      }
    } else {
      if (imY != null && imY != undefined) {
        return {
          ...state,
          _data: { ...state._data, y: imY },
        };
      } else {
        return state;
      }
    }
  }
  // return state;
};

export const spectrumReducer = (state, action) => {
  switch (action.type) {
    case PEAK_PICKING:
      return addPeak(state);
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

    case LOADING_SPECTRUM:
      return loadSpectrum(state, action.binaryData);

    case SHIFT_SPECTRUM:
      return shiftSpectrumAlongXAxis(state, action.shiftValue);

    case CHANGE_SPECTRUM_TYPE:
      return changeSpectrumType(state, action.isRealSpectrumVisible);

    default:
      return state;
  }
};
