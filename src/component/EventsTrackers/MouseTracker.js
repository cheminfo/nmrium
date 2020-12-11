import { createContext, useCallback, useState, useContext } from 'react';

export const MouseContext = createContext();
const MouseaProvider = MouseContext.Provider;

export function useMouseTracker() {
  return useContext(MouseContext);
}

export function MouseTracker({ children, className, style, noPropagation }) {
  const [mouseTrackerState, setMouseTrackerState] = useState(null);
  const mouseMoveHandler = useCallback(
    (e) => {
      const boundingRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - boundingRect.x;
      const y = e.clientY - boundingRect.y;
      setMouseTrackerState({ x, y });
      if (noPropagation) {
        e.stopPropagation();
      }
    },
    [noPropagation],
  );

  const mouseLeaveHandler = useCallback(
    (e) => {
      setMouseTrackerState(null);
      if (noPropagation) {
        e.stopPropagation();
      }
    },
    [noPropagation],
  );

  return (
    <MouseaProvider value={mouseTrackerState}>
      <div
        className={className}
        style={style}
        onMouseMove={mouseMoveHandler}
        onMouseLeave={mouseLeaveHandler}
      >
        {children}
      </div>
    </MouseaProvider>
  );
}
