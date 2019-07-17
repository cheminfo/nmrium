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
  FULL_ZOOM_OUT
} from './action';

import { UNDO, REDO, RESET } from './undo-action';

import { SHIFT_X } from '../../data/filter1d/filter1d-type';
// import applyFilter from '../../data/filter1d/filter';

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
  dataumObject = Datum1D.InitiateInstance(data.x, data.y, data.y);

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
  dataumObject.addFilter({ kind: SHIFT_X, value: shiftValue });
  dataumObject.applyShiftXFiliter(shiftValue);
  //add to undo history
  const history = handleHistorySet(state.history, {
    kind: SHIFT_X,
    value: shiftValue,
  });

  // if(_orignDomain.x[0] == _xDomain[0] && _orignDomain.x[1] ==_xDomain[1] )

  const domain = getDomain({ x: dataumObject.x, y: dataumObject.re });
  return {
    ...state,
    _data: { ...state._data, x: dataumObject.x, y: dataumObject.re },
    _xDomain: (state._orignDomain.x[0] === state._xDomain[0] && state._orignDomain.x[1] ===state._xDomain[1] ) ? domain.x:state._xDomain,
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


const zoomOut = (state)=>{
  return {...state,_xDomain:state._orignDomain.x,_yDomain:state._orignDomain.y};
}

const changeSpectrumType = (state, isRealSpectrumVisible) => {
  if (dataumObject) {
    const reY = dataumObject.getReal().y;
    const imY = dataumObject.getImaginary().y;

    if (isRealSpectrumVisible) {
      if (reY != null && reY != undefined) {
        console.log(reY);

        return {
          ...state,
          _data: { ...state._data, y: reY },
        };
      } else {
        return state;
      }
    } else {
      if (imY != null && imY != undefined) {
        console.log(imY);
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

//////////////////////////////////////////////////////////////////////
//////////////// start undo and redo functions ///////////////////////
//////////////////////////////////////////////////////////////////////

const handleHistoryUndo = (state) => {

  const { past, present, future } = state.history;
  const previous = past[past.length - 1];
  const newPast = past.slice(0, past.length - 1);
  const newfuture = [present, ...future];

  const hasRedo = newfuture.length !== 0;
  const hasUndo = newPast.length !== 0; 

  const data = Datum1D.getInstance().undoFilter(newPast);
  const domain = getDomain(data);

  return {
    ...state,
    _data: {...state._data,x:data.x,y:data.y},
    _xDomain: domain.x,
    _yDomain: domain.y,
    _orignDomain: domain,
    history: {
      past: newPast,
      present: previous,
      future: newfuture,
      hasRedo,
      hasUndo,
    },
  };
};

const handleHistoryRedo = (state) => {
  const { past, present, future } = state.history;
  const next = future[0];
  const newFuture = future.slice(1);
  const newPast =  [...past, present];

  const hasUndo = newPast.length !== 0;
  const hasRedo = newFuture.length !== 0;

  const data = Datum1D.getInstance().redoFilter(next);
  const domain = getDomain(data);


  return {
    ...state,
    _data: {...state._data,x:data.x,y:data.y},
    _xDomain: domain.x,
    _yDomain: domain.y,
    _orignDomain: domain,
    history: {
      past: newPast,
      present: next,
      future: newFuture,
      hasRedo,
      hasUndo,
    },
  };
};

const handleHistorySet = (state, action) => {
  const newValue = action;

  const { past, present } = state;

  if (newValue === present) {
    return state;
  }

  return {
    past: (present !=null)? [...past, present]:[...past],
    present: newValue,
    future: [],
    hasUndo: true,
    hasRedo:false,
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

    case FULL_ZOOM_OUT:
      return zoomOut(state);  

    case LOADING_SPECTRUM:
      return loadSpectrum(state, action.binaryData);

    case SHIFT_SPECTRUM:
      return shiftSpectrumAlongXAxis(state, action.shiftValue);

    case CHANGE_SPECTRUM_TYPE:
      return changeSpectrumType(state, action.isRealSpectrumVisible);

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
