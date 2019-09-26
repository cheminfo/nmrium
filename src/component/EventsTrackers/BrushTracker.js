import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';

export const BrushContext = createContext();

const initialState = {
  step: 'initial',
  brush: {
    start: null,
    end: null,
  },
};

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
  const [state, dispatch] = useReducer(reducer, initialState);
  const [scale, setScale] = useState(1);
  const [mouseUpTime, setMouseUpTime] = useState();

  const mouseDownHandler = useCallback(
    (event) => {
      if (noPropagation) {
        event.stopPropagation();
      }
      dispatch({
        type: 'DOWN',
        screenX: event.screenX,
        screenY: event.screenY,
        clientX: event.clientX,
        clientY: event.clientY,
        boundingRect: event.currentTarget.getBoundingClientRect(),
      });
      return false;
    },
    [noPropagation],
  );

  const clickHandler = useCallback(
    (e) => {
      if (mouseUpTime - e.timeStamp !== 0) {
        const boundingRect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - boundingRect.x;
        const y = e.clientY - boundingRect.y;
        onClick({ x, y });
      }
    },
    [onClick],
  );

  const mouseDoubleClickHandler = useCallback(
    (event) => {
      if (noPropagation) {
        event.stopPropagation();
      }
      onDoubleClick(event);
    },
    [noPropagation, onDoubleClick],
  );

  const isNegative = useCallback((n) => {
    return ((n = +n) || 1 / n) < 0;
  }, []);

  const handleMouseWheel = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      let ZOOM_STEP =
        event.deltaMode === 1
          ? 0.1 * Math.abs(event.deltaY)
          : event.deltaMode
          ? 1
          : 0.1 * (Math.abs(event.deltaY) / 100);

      const direction = isNegative(event.deltaY) ? 'up' : 'down';
      let _scale = scale;
      if (direction === 'up') {
        _scale = scale + ZOOM_STEP;
      } else {
        _scale = scale - ZOOM_STEP;
      }

      // if (_scale > 0) {
      onZoom({ scale: _scale });
      setScale(_scale);
      // } else {
      //   setScale(0);
      // }
    },
    [isNegative, onZoom, scale],
  );

  useEffect(() => {
    if (state.step === 'end') {
      onBrush(state);
    }
  }, [state]);

  useEffect(() => {
    const moveCallback = (event) =>
      dispatch({
        type: 'MOVE',
        screenX: event.screenX,
        screenY: event.screenY,
      });

    const upCallback = (event) => {
      setMouseUpTime(event.timeStamp);
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
        onDoubleClick={mouseDoubleClickHandler}
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
        const { screenX, screenY, clientX, clientY, boundingRect } = action;
        const x = clientX - boundingRect.x;
        const y = clientY - boundingRect.y;

        return {
          ...state,
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

    default:
      return state;
  }
}
