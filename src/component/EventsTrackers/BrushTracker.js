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
  onDoubleClick,
  noPropagation,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [scale, setScale] = useState(1);

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
    },
    [noPropagation],
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

      const direction =
        isNegative(event.deltaX) && isNegative(event.deltaY) ? 'up' : 'down';
      let _scale = scale;
      if (direction === 'up') {
        _scale = scale + ZOOM_STEP;
      } else {
        _scale = scale - ZOOM_STEP;
      }
      setScale(_scale);
    },
    [isNegative, scale],
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

    const upCallback = (event) =>
      dispatch({
        type: 'UP',
        screenX: event.screenX,
        screenY: event.screenY,
      });
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
        onWheel={handleMouseWheel}
      >
        {children}
      </div>
    </BrushContext.Provider>
  );
}
const ZOOM_STEP = 0.03;

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
