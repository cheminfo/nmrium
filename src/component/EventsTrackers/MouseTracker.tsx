import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

interface MouseTrackerData {
  x: number;
  y: number;
}

const MouseContext = createContext<MouseTrackerData | null>(null);
const MouseProvider = MouseContext.Provider;

export function useMouseTracker() {
  if (!MouseContext) {
    throw new Error('Mouse context was not found');
  }
  return useContext(MouseContext);
}

interface MouseTrackerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  noPropagation?: boolean;
}

const disableMouseAttribute = 'data-disable-mouse-tracking' as const;

function isMouseTrackingDisabled(target: EventTarget) {
  return (
    (target as Element).closest(`[${CSS.escape(disableMouseAttribute)}]`) !==
    null
  );
}

export const disableMouseTrackingProps = {
  [disableMouseAttribute]: true,
} as const;

export function MouseTracker(props: MouseTrackerProps) {
  const { children, className, style, noPropagation } = props;
  const [mouseTrackerState, setMouseTrackerState] =
    useState<MouseTrackerData | null>(null);
  const mouseMoveHandler = useCallback(
    (event: MouseEvent) => {
      if (isMouseTrackingDisabled(event.target)) {
        setMouseTrackerState(null);
        if (noPropagation) {
          event.stopPropagation();
        }
        return;
      }

      const boundingRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - boundingRect.x;
      const y = event.clientY - boundingRect.y;
      setMouseTrackerState({ x, y });
      if (noPropagation) {
        event.stopPropagation();
      }
    },
    [noPropagation],
  );

  const mouseLeaveHandler = useCallback(
    (event: MouseEvent) => {
      setMouseTrackerState(null);
      if (noPropagation) {
        event.stopPropagation();
      }
    },
    [noPropagation],
  );

  return (
    <MouseProvider value={mouseTrackerState}>
      <div
        className={className}
        style={style}
        onMouseMove={mouseMoveHandler}
        onMouseLeave={mouseLeaveHandler}
      >
        {children}
      </div>
    </MouseProvider>
  );
}
