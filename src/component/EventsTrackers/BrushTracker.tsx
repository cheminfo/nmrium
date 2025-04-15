import type { CSSProperties, ReactNode, Reducer } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import type { ActionType } from '../reducer/types/ActionType.js';

type Step = 'initial' | 'start' | 'end' | 'brushing';

export type BrushAxis = 'X' | 'Y' | 'XY';
export interface BrushTrackerData {
  step: Step;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  shiftKey: boolean;
  altKey: boolean;
  mouseButton: MouseButton;
}

type MouseButton = 'main' | 'secondary' | 'unknown';

const MouseButtons: Record<number, MouseButton> = {
  0: 'main',
  2: 'secondary',
} as const;

export interface BrushCoordination {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
}
interface BrushScreenCoordination {
  startScreenX: number;
  startScreenY: number;
  startClientX: number;
  startClientY: number;
}

interface BrushTrackerState
  extends BrushTrackerData,
    BrushCoordination,
    BrushScreenCoordination {
  step: Step;
  boundingRect: DOMRect | null;
}

const initialState: BrushTrackerState = {
  step: 'initial',
  mouseButton: 'unknown',
  shiftKey: false,
  altKey: false,
  startX: 0,
  endX: 0,
  startY: 0,
  endY: 0,
  startScreenX: 0,
  startScreenY: 0,
  startClientX: 0,
  startClientY: 0,
  boundingRect: null,
};

function stopPageScrolling(event) {
  event.preventDefault();
}

const BrushContext = createContext<BrushTrackerData>(initialState);

export function useBrushTracker() {
  if (!BrushContext) {
    throw new Error('Brush context was not found');
  }
  return useContext(BrushContext);
}

interface Position {
  x: number;
  y: number;
}

export type ClickOptions = React.MouseEvent & Position;
export type OnClick = (element: ClickOptions) => void;
export type { OnClick as OnDoubleClick };
export type ZoomOptions = Pick<
  React.WheelEvent,
  'deltaY' | 'shiftKey' | 'deltaMode' | 'altKey'
> &
  Position & { invertScroll?: boolean };
export type OnZoom = (options: ZoomOptions) => void;
export type OnBrush = (state: BrushTrackerData) => void;

interface BrushTrackerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onBrushEnd?: OnBrush;
  onBrush?: OnBrush;
  onZoom?: OnZoom;
  onDoubleClick?: OnClick;
  onClick?: OnClick;
  noPropagation?: boolean;
}

export function BrushTracker({
  children,
  className,
  style,
  onBrushEnd,
  onBrush,
  onZoom = () => null,
  onDoubleClick = () => null,
  onClick = () => null,
  noPropagation,
}: BrushTrackerProps) {
  const [state, dispatch] = useReducer<
    Reducer<BrushTrackerState, BrushTrackerAction>
  >(reducer, initialState);
  const clickCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPointRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  const clickHandler = useCallback(
    (event: React.MouseEvent, targetElement: Element) => {
      const boundingRect = targetElement.getBoundingClientRect();
      const x = event.clientX - boundingRect.x;
      const y = event.clientY - boundingRect.y;

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Count clicks
      clickCountRef.current += 1;

      // Set a timeout to distinguish between single and double clicks
      timeoutRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          onClick({ ...event, x, y });
        } else if (clickCountRef.current === 2) {
          onDoubleClick({ ...event, x, y });
        }

        // Reset the click count
        clickCountRef.current = 0;
      }, 200);
    },
    [onClick, onDoubleClick],
  );

  const pointerDownHandler = useCallback(
    (event: React.PointerEvent) => {
      const targetElement = event.currentTarget;
      isDraggingRef.current = false; // Reset dragging flag

      //check that the right or left mouse button pressed
      if ([0, 2].includes(event.button)) {
        if (noPropagation) {
          event.stopPropagation();
        }
        dispatch({
          type: 'DOWN',
          payload: {
            mouseButton: MouseButtons[event.button],
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY,
            boundingRect: event.currentTarget.getBoundingClientRect(),
          },
        });
      }

      function moveCallback(event: PointerEvent) {
        isDraggingRef.current = true; // set flag to true to skip click event if the user dragged the mouse

        dispatch({
          type: 'MOVE',
          payload: {
            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY,
          },
        });
      }

      function upCallback() {
        if (isDraggingRef.current) {
          dispatch({
            type: 'UP',
          });
        } else {
          dispatch({
            type: 'DONE',
          });
          clickHandler(event, targetElement);
        }

        globalThis.removeEventListener('pointermove', moveCallback);
        globalThis.removeEventListener('pointerup', upCallback);
      }

      globalThis.addEventListener('pointermove', moveCallback);
      globalThis.addEventListener('pointerup', upCallback);

      return false;
    },
    [clickHandler, noPropagation],
  );

  const handleMouseWheel = useCallback(
    (event: React.WheelEvent) => {
      const boundingRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - boundingRect.x;
      const y = event.clientY - boundingRect.y;

      const { deltaY, deltaX, shiftKey, altKey, deltaMode } = event;
      onZoom({ deltaY: deltaY || deltaX, shiftKey, altKey, deltaMode, x, y });
    },
    [onZoom],
  );

  useEffect(() => {
    const { step, startX, endX, startY, endY } = state;
    const point = Math.hypot(endX - startX, endY - startY);
    if (
      (step === 'end' || step === 'brushing') &&
      lastPointRef.current !== point
    ) {
      onBrush?.(state);
      lastPointRef.current = point;
    }

    if (step === 'end' && point > 5) {
      onBrushEnd?.(state);
      dispatch({
        type: 'DONE',
      });
    }
  }, [onBrush, onBrushEnd, state]);

  return (
    <BrushContext.Provider value={state}>
      <div
        className={className}
        style={{ ...style, touchAction: 'none' }}
        onPointerDown={pointerDownHandler}
        onWheel={handleMouseWheel}
        onMouseEnter={() => {
          // disable page scrolling once the mouse over the Displayer
          window.addEventListener('wheel', stopPageScrolling, {
            passive: false,
          });
        }}
        onMouseLeave={() => {
          // disable page scrolling once the mouse over the Displayer
          window.removeEventListener('wheel', stopPageScrolling);
        }}
      >
        {children}
      </div>
    </BrushContext.Provider>
  );
}

interface MouseCoordinates {
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
}

type DownAction = ActionType<
  'DOWN',
  MouseCoordinates & {
    shiftKey: boolean;
    altKey: boolean;
    mouseButton: MouseButton;
    boundingRect: DOMRect;
  }
>;
type MoveAction = ActionType<'MOVE', MouseCoordinates>;

type BrushTrackerAction = ActionType<'UP' | 'DONE'> | DownAction | MoveAction;

function reducer(
  state: BrushTrackerState,
  action: BrushTrackerAction,
): BrushTrackerState {
  switch (action.type) {
    case 'UP':
      if (state.step === 'brushing' || state.step === 'start') {
        return {
          ...state,
          step: state.step === 'start' ? 'initial' : 'end',
        };
      }
      return state;
    case 'DOWN':
      if (state.step === 'initial' || state.step === 'end') {
        const {
          shiftKey,
          altKey,
          mouseButton,
          screenX,
          screenY,
          clientX,
          clientY,
          boundingRect,
        } = action.payload;
        const x = clientX - boundingRect.x;
        const y = clientY - boundingRect.y;
        return {
          ...state,
          shiftKey,
          altKey,
          mouseButton,
          startX: x,
          startY: y,
          startScreenX: screenX,
          startScreenY: screenY,
          startClientX: clientX,
          startClientY: clientY,
          boundingRect,
          step: 'start',
        };
      }
      return state;
    case 'MOVE':
      if (state.step === 'start' || state.step === 'brushing') {
        const { clientX, clientY } = action.payload;

        const { x = 0, y = 0 } = state.boundingRect || {};
        return {
          ...state,
          step: 'brushing',
          endX: clientX - x,
          endY: clientY - y,
        };
      }
      return state;
    case 'DONE':
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

interface DetectBrushingResult extends BrushCoordination {
  type: BrushAxis;
  scaleX: number;
  scaleY: number;
}

export function detectBrushing(
  coordination: BrushCoordination,
  width: number,
  height: number,
  threshold = 0.03,
): DetectBrushingResult {
  const { startX, endX, startY, endY } = coordination;
  const xDiff = Math.abs(endX - startX);
  const yDiff = Math.abs(endY - startY);
  const xThreshold = width * threshold;
  const yThreshold = height * threshold;
  const scaleY = (endY - startY) / height;
  const scaleX = (endX - startX) / width;

  if (xDiff >= xThreshold && yDiff < yThreshold) {
    return {
      type: 'X',
      startX,
      endX,
      startY: 0,
      endY: height,
      scaleX,
      scaleY: 1,
    };
  }

  if (yDiff >= yThreshold && xDiff < xThreshold) {
    return {
      type: 'Y',
      startX: 0,
      endX: width,
      startY,
      endY,
      scaleX: 1,
      scaleY,
    };
  }

  return { type: 'XY', startX, startY, endX, endY, scaleX, scaleY };
}
