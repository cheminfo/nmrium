import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import lodash from 'lodash';

import { useChartData } from '../context/ChartContext';
import { options } from '../toolbar/ToolTypes';

export const BrushContext = createContext();

const initialState = {
  step: 'initial',
  brush: {
    start: null,
    end: null,
  },
};

let debounceClickEvents = [];
let scale = 1;

export function BrushTracker({
  children,
  className,
  style,
  onBrush,
  onZoom,
  onDoubleClick,
  onClick,
  noPropagation,
}) {
  const { zoomFactor, integralZoomFactor, selectedTool } = useChartData();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mouseDownTime, setMouseDownTime] = useState();

  useEffect(() => {
    scale =
      selectedTool === options.integral.id
        ? integralZoomFactor.scale
        : zoomFactor.scale;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTool]);

  const mouseDownHandler = useCallback(
    (event) => {
      if (noPropagation) {
        event.stopPropagation();
      }
      dispatch({
        type: 'DOWN',
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        screenX: event.screenX,
        screenY: event.screenY,
        clientX: event.clientX,
        clientY: event.clientY,
        boundingRect: event.currentTarget.getBoundingClientRect(),
      });

      setMouseDownTime(event.timeStamp);

      return false;
    },
    [noPropagation],
  );

  const clickHandler = useCallback(
    (e) => {
      const timeStamp = e.timeStamp;
      const boundingRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - boundingRect.x;
      const y = e.clientY - boundingRect.y;

      const callback = lodash.debounce(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (
          timeStamp - mouseDownTime <= 150 &&
          debounceClickEvents.length === 1
        ) {
          onClick({ x, y });
        }
        debounceClickEvents = [];
      }, 200);
      debounceClickEvents.push(callback);

      callback();

      if (debounceClickEvents.length > 1) {
        lodash.map(debounceClickEvents, (debounce) => debounce.cancel());
        debounceClickEvents = [];
        onDoubleClick(e);
      }
    },
    [mouseDownTime, onClick, onDoubleClick],
  );

  // const mouseDoubleClickHandler = useCallback(
  //   (event) => {
  //     if (noPropagation) {
  //       event.stopPropagation();
  //     }
  //     onDoubleClick(event);
  //   },
  //   [noPropagation, onDoubleClick],
  // );

  const isNegative = useCallback((n) => {
    return ((n = +n) || 1 / n) < 0;
  }, []);

  const handleMouseWheel = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      const deltaYValue =
        Math.abs(event.deltaY) === 1
          ? Math.abs(event.deltaY)
          : Math.abs(event.deltaY) / 100;

      let ZOOM_STEP =
        event.deltaMode === 1
          ? deltaYValue <= 3
            ? 0.01
            : 0.05 * event.deltaMode
          : event.deltaMode
          ? 1
          : deltaYValue <= 3
          ? 0.01
          : 0.05 * deltaYValue;

      const direction = isNegative(event.deltaY) ? 'up' : 'down';
      let _scale = scale;

      if (direction === 'up') {
        _scale = scale + ZOOM_STEP;
      } else {
        _scale = scale - ZOOM_STEP;
      }
      if (_scale >= 0 || _scale === 0) {
        onZoom({ scale: _scale });
        scale = _scale;
      } else {
        onZoom({ scale: 0 });
        scale = _scale;
      }
    },
    [isNegative, onZoom],
  );

  useEffect(() => {
    if (state.step === 'end') {
      onBrush(state);
      dispatch({
        type: 'DONE',
      });
    }
  }, [onBrush, state]);

  useEffect(() => {
    const moveCallback = (event) => {
      dispatch({
        type: 'MOVE',
        screenX: event.screenX,
        screenY: event.screenY,
      });
    };

    const upCallback = (event) => {
      dispatch({
        type: 'UP',
        screenX: event.screenX,
        screenY: event.screenY,
      });

      return false;
    };
    document.addEventListener('mousemove', moveCallback);
    document.addEventListener('mouseup', upCallback);

    return () => {
      document.removeEventListener('mousemove', moveCallback);
      document.removeEventListener('mouseup', upCallback);
    };
  }, []);

  return (
    <BrushContext.Provider value={state}>
      <div
        className={className}
        style={style}
        onMouseDown={mouseDownHandler}
        // onDoubleClick={mouseDoubleClickHandler}
        onClick={clickHandler}
        onWheel={handleMouseWheel}
      >
        {children}
      </div>
    </BrushContext.Provider>
  );
}

function reducer(state, action) {
  switch (action.type) {
    case 'UP':
      if (state.step === 'brushing' || state.step === 'start') {
        const { screenX, screenY } = action;
        return {
          ...state,
          endX: state.startX + screenX - state.startScreenX,
          endY: state.startY + screenY - state.startScreenY,
          step: state.step === 'start' ? 'initial' : 'end',
        };
      }
      return state;
    case 'DOWN':
      if (state.step === 'initial' || state.step === 'end') {
        const {
          screenX,
          screenY,
          clientX,
          clientY,
          boundingRect,
          shiftKey,
          altKey,
        } = action;
        const x = clientX - boundingRect.x;
        const y = clientY - boundingRect.y;

        return {
          ...state,
          shiftKey,
          altKey,
          startX: x,
          startY: y,
          startScreenX: screenX,
          startScreenY: screenY,
          step: 'start',
        };
      }
      return state;
    case 'MOVE':
      if (state.step === 'start' || state.step === 'brushing') {
        const { screenX, screenY } = action;
        return {
          ...state,
          step: 'brushing',
          endX: state.startX + screenX - state.startScreenX,
          endY: state.startY + screenY - state.startScreenY,
        };
      }
      return state;
    case 'DONE':
      if (state.step === 'end') {
        return {
          ...state,
          step: 'initial',
        };
      }
      break;
    default:
      return state;
  }
}
