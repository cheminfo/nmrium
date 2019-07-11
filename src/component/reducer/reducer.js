import {
  PEAK_PICKING,
  SHIFT_SPECTRUM,
  LOADING_SPECTRUM,
  SET_ORGINAL_DOMAIN,
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_WIDTH,
  SET_POINTER_COORDINATES,
  SET_SELECTED_TOOL
} from './action';
import * as d3 from 'd3';

const getScale = ({ _xDomain, _yDomain, _width, _height, _margin }) => {
  console.log(_xDomain);
  const x = d3.scaleLinear(_xDomain, [_width - _margin.right, _margin.left]);
  const y = d3.scaleLinear(_yDomain, [_height - _margin.bottom, _margin.top]);
  return { x, y };
};

const getClosePeak = (xShift, state) => {
  const scale = getScale(state);
  const { _rulersCoordinates, _data } = state;
  const zoon = [
    scale.x.invert(_rulersCoordinates.x - xShift),
    scale.x.invert(_rulersCoordinates.x + xShift),
  ];
  console.log(zoon);

  var maxIndex = _data.x.findIndex((number) => number >= zoon[0]) - 1;
  var minIndex = _data.x.findIndex((number) => number >= zoon[1]);

  const selctedYData = _data.y.slice(minIndex, maxIndex);

  const peakYValue = d3.max(selctedYData);
  const xIndex = selctedYData.findIndex((value) => value === peakYValue);
  const peakXValue = _data.x[minIndex + xIndex];

  return { x: peakXValue, y: peakYValue };
};

const addPeak = (state) => {
  const peak = getClosePeak(10, state);
  const points = [...state._peakNotations];

  if (
    state._peakNotations.findIndex(
      (nelement) => nelement.id === peak.x.toString() + '-' + peak.y,
    ) == -1
  ) {
    points.push({
      x: peak.x,
      y: peak.y,
      id: peak.x.toString() + '-' + peak.y,
    });

    return { ...state, _peakNotations: points };
  }
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

export const spectrumReducer = (state, action) => {
    console.log(state);

  switch (action.type) {
    case PEAK_PICKING:
      return addPeak(state);

    case SET_ORGINAL_DOMAIN:
      return setOrginalDomain(state, action.orignDomain);

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

    default:
      return state;
  }
};
