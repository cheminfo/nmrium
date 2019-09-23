import React, { createContext, useCallback, useState } from 'react';

export const MouseContext = createContext();

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
    <MouseContext.Provider value={mouseTrackerState}>
      <div
        className={className}
        style={style}
        onMouseMove={mouseMoveHandler}
        onMouseLeave={mouseLeaveHandler}
      >
        {children}
      </div>
    </MouseContext.Provider>
  );
}
