import {
  CSSProperties,
  createContext,
  useCallback,
  useState,
  useContext,
  ReactNode,
} from 'react';

interface MouseTrackerData {
  x: number;
  y: number;
}

export const MouseContext = createContext<MouseTrackerData | null>(null);
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

export function MouseTracker({
  children,
  className,
  style,
  noPropagation,
}: MouseTrackerProps) {
  const [mouseTrackerState, setMouseTrackerState] =
    useState<MouseTrackerData | null>(null);
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
