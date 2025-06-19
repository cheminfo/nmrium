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

type AdvanceOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type BaseDetectBrushingOptions = AdvanceOmit<
  DetectBrushingOptions,
  'width' | 'height'
>;
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

const BrushDetectionOptionsContext = createContext<BaseDetectBrushingOptions>({
  thresholdFormat: 'fixed',
});
const BrushContext = createContext<BrushTrackerData>(initialState);

export function useBrushDetectionOptions() {
  if (!BrushDetectionOptionsContext) {
    throw new Error('Brush detection options context was not found');
  }
  return useContext(BrushDetectionOptionsContext);
}

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
  'deltaY' | 'shiftKey' | 'deltaMode' | 'altKey' | 'deltaX' | 'ctrlKey'
> &
  Position & { invertScroll?: boolean; isBidirectionalZoom: boolean };
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
  brushDetectionOptions?: BaseDetectBrushingOptions;
}

function getMouseXY(event: React.MouseEvent) {
  const boundingRect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - boundingRect.x;
  const y = event.clientY - boundingRect.y;
  return { x, y };
}

export function BrushTracker(options: BrushTrackerProps) {
  const {
    children,
    className,
    style,
    onBrushEnd,
    onBrush,
    onZoom = () => null,
    onDoubleClick = () => null,
    onClick = () => null,
    noPropagation,
    brushDetectionOptions = { thresholdFormat: 'fixed' },
  } = options;

  const [state, dispatch] = useReducer<
    Reducer<BrushTrackerState, BrushTrackerAction>
  >(reducer, initialState);

  const lastPointRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const boundingRectRef = useRef<DOMRect | null>(null);
  const startPositionRef = useRef<Position>({ x: 0, y: 0 });
  const lastRef = useRef<Position>({ x: 0, y: 0 });

  function handleClick(event: React.MouseEvent) {
    if (isDraggingRef.current) return;

    const { x, y } = getMouseXY(event);
    onClick({ ...event, x, y });
  }

  function handleDoubleClick(event: React.MouseEvent) {
    if (isDraggingRef.current) return;

    const { x, y } = getMouseXY(event);
    onDoubleClick({ ...event, x, y });
  }

  const pointerDownHandler = useCallback(
    (event: React.PointerEvent) => {
      // const targetElement = event.currentTarget;
      isDraggingRef.current = false; // Reset dragging flag

      //check that the right or left mouse button pressed
      if ([0, 2].includes(event.button)) {
        if (noPropagation) {
          event.stopPropagation();
        }

        const boundingRect = event.currentTarget.getBoundingClientRect();
        boundingRectRef.current = boundingRect;
        startPositionRef.current = {
          x: event.clientX - boundingRect.x,
          y: event.clientY - boundingRect.y,
        };
        lastRef.current = { x: 0, y: 0 };

        if (!event.ctrlKey) {
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
              boundingRect,
            },
          });
        }
      }

      function moveCallback(event: PointerEvent) {
        isDraggingRef.current = true; // set flag to true to skip click event if the user dragged the mouse
        const { clientX, clientY, shiftKey, altKey, ctrlKey } = event;

        if (event.ctrlKey) {
          if (boundingRectRef.current) {
            const boundingRect = boundingRectRef.current;

            const x = clientX - boundingRect.x;
            const y = clientY - boundingRect.y;

            if (lastRef.current.x > 0 && lastRef.current.y > 0) {
              const deltaX = x - lastRef.current.x;
              const deltaY = y - lastRef.current.y;

              onZoom({
                deltaY,
                deltaX,
                shiftKey,
                altKey,
                x: startPositionRef.current.x,
                y: startPositionRef.current.y,
                ctrlKey,
                deltaMode: 0,
                isBidirectionalZoom: true,
              });
            }
            lastRef.current = { x, y };
          }
        } else {
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
      }

      function upCallback() {
        if (isDraggingRef.current) {
          dispatch({
            type: 'UP',
          });
        }

        globalThis.removeEventListener('pointermove', moveCallback);
        globalThis.removeEventListener('pointerup', upCallback);
      }

      globalThis.addEventListener('pointermove', moveCallback);
      globalThis.addEventListener('pointerup', upCallback);

      return false;
    },
    [noPropagation, onZoom],
  );

  const handleMouseWheel = useCallback(
    (event: React.WheelEvent) => {
      const boundingRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - boundingRect.x;
      const y = event.clientY - boundingRect.y;

      const { deltaY, deltaX, shiftKey, altKey, ctrlKey, deltaMode } = event;
      onZoom({
        deltaY,
        deltaX,
        shiftKey,
        altKey,
        ctrlKey,
        deltaMode,
        x,
        y,
        isBidirectionalZoom: false,
      });
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
    <BrushDetectionOptionsContext.Provider value={brushDetectionOptions}>
      <BrushContext.Provider value={state}>
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => {
            if (e.ctrlKey && e.button === 0) {
              e.preventDefault();
            }
          }}
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
    </BrushDetectionOptionsContext.Provider>
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
  directionX: number;
  directionY: number;
  xThreshold: number;
  yThreshold: number;
}
interface DetectBrushingThreshold {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /**
   * Threshold as a percentage of width and height (value between 0 and 1).
   * @default 0.02
   */
  threshold?: number;
  thresholdFormat: 'relative';
}
interface DetectBrushingThresholdSize {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /**
   * Threshold size in pixels.
   * @default 80
   */
  thresholdSize?: number;
  thresholdFormat: 'fixed';
}
type BrushDetectionThresholdAxis = 'both' | 'x' | 'y';

type DetectBrushingOptions = { thresholdAxis?: BrushDetectionThresholdAxis } & (
  | DetectBrushingThreshold
  | DetectBrushingThresholdSize
);

export function detectBrushing(
  coordination: BrushCoordination,
  options: DetectBrushingOptions,
): DetectBrushingResult {
  let xThreshold;
  let yThreshold;
  const { width, height, thresholdFormat, thresholdAxis = 'both' } = options;
  const { startX: x1, endX: x2, startY: y1, endY: y2 } = coordination;
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);
  const directionX = endX >= startX ? 1 : -1;
  const directionY = endY >= startY ? 1 : -1;

  const xDiff = Math.abs(endX - startX);
  const yDiff = Math.abs(endY - startY);

  if (thresholdFormat === 'relative') {
    const { threshold = 0.02 } = options;
    xThreshold = width * threshold;
    yThreshold = height * threshold;
  }

  if (thresholdFormat === 'fixed') {
    const { thresholdSize = 80 } = options;
    xThreshold = thresholdSize;
    yThreshold = thresholdSize;
  }

  const scaleY = (endY - startY) / height;
  const scaleX = (endX - startX) / width;

  const common = {
    directionX,
    directionY,
    xThreshold,
    yThreshold,
  };
  if (thresholdAxis === 'y') {
    if (yDiff >= yThreshold && yThreshold > 0) {
      return {
        type: 'XY',
        startX,
        startY,
        endX,
        endY,
        scaleX,
        scaleY,
        ...common,
      };
    }

    return {
      type: 'X',
      startX,
      endX,
      startY: 0,
      endY: height,
      scaleX,
      scaleY: 1,
      ...common,
    };
  }
  if (thresholdAxis === 'x') {
    if (xDiff >= xThreshold && xThreshold > 0) {
      return {
        type: 'XY',
        startX,
        startY,
        endX,
        endY,
        scaleX,
        scaleY,
        ...common,
      };
    }

    return {
      type: 'Y',
      startX: 0,
      endX: width,
      startY,
      endY,
      scaleX: 1,
      scaleY,
      ...common,
    };
  }

  if (yDiff < yThreshold) {
    return {
      type: 'X',
      startX,
      endX,
      startY: 0,
      endY: height,
      scaleX,
      scaleY: 1,
      ...common,
    };
  }

  if (xDiff < xThreshold) {
    return {
      type: 'Y',
      startX: 0,
      endX: width,
      startY,
      endY,
      scaleX: 1,
      scaleY,
      ...common,
    };
  }

  return {
    type: 'XY',
    startX,
    startY,
    endX,
    endY,
    scaleX,
    scaleY,
    ...common,
  };
}
