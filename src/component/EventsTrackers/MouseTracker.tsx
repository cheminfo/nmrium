import {
  CSSProperties,
  createContext,
  useCallback,
  useState,
  useContext,
  ReactNode,
} from 'react';

export const MouseContext = createContext<any>({});
const MouseaProvider = MouseContext.Provider;

export function useMouseTracker() {
  return useContext(MouseContext);
}

interface MouseTrackerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  noPropagation: boolean;
}

export function MouseTracker({
  children,
  className,
  style,
  noPropagation,
}: MouseTrackerProps) {
  const [mouseTrackerState, setMouseTrackerState] =
    useState<{ x: number; y: number } | null>(null);
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
