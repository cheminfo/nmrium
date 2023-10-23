import lodashDebounce from 'lodash/debounce';
import lodashMap from 'lodash/map';
import {
  createContext,
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useContext,
  Reducer,
} from 'react';

import { ActionType } from '../reducer/types/ActionType';

type Step = 'initial' | 'start' | 'end' | 'brushing';
export interface BrushTrackerContext {
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
interface BrushTrackerState extends BrushTrackerContext {
  step: Step;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  startScreenX: number;
  startScreenY: number;
  startClientX: number;
  startClientY: number;
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

export const BrushContext = createContext<BrushTrackerContext>(initialState);

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
export type OnClick = (element: React.MouseEvent & Position) => void;
export type { OnClick as OnDoubleClick };
export type OnZoom = (
  event: Pick<React.WheelEvent, 'deltaY' | 'shiftKey' | 'deltaMode'> & Position,
) => void;
export type OnBrush = (state: BrushTrackerContext) => void;

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
  const [mouseDownTime, setMouseDownTime] = useState<number>(0);
  const debounceClickEventsRef = useRef<any[]>([]);
  const lastPointRef = useRef<number>(0);

  const pointerDownHandler = useCallback(
    (event: React.PointerEvent) => {
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

        setMouseDownTime(event.timeStamp);
      }

      function moveCallback(event: PointerEvent) {
        // event.preventDefault();
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
        dispatch({
          type: 'UP',
        });
        window.removeEventListener('pointermove', moveCallback);
        window.removeEventListener('pointerup', upCallback);
      }

      window.addEventListener('pointermove', moveCallback);
      window.addEventListener('pointerup', upCallback);

      return false;
    },
    [noPropagation],
  );

  const clickHandler = useCallback(
    (e: React.MouseEvent) => {
      const timeStamp = e.timeStamp;
      const boundingRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - boundingRect.x;
      const y = e.clientY - boundingRect.y;

      const callback = lodashDebounce(() => {
        if (
          timeStamp - mouseDownTime <= 150 &&
          debounceClickEventsRef.current.length === 1
        ) {
          onClick({ ...e, x, y });
        }
        debounceClickEventsRef.current = [];
      }, 200);

      debounceClickEventsRef.current.push(callback);

      callback();

      if (debounceClickEventsRef.current.length > 1) {
        lodashMap(debounceClickEventsRef.current, (debounce) =>
          debounce.cancel(),
        );
        debounceClickEventsRef.current = [];
        onDoubleClick({ ...e, x, y });
      }
    },
    [mouseDownTime, onClick, onDoubleClick],
  );

  const handleMouseWheel = useCallback(
    (event: React.WheelEvent) => {
      const boundingRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - boundingRect.x;
      const y = event.clientY - boundingRect.y;

      const { deltaY, deltaX, shiftKey, deltaMode } = event;
      onZoom({ deltaY: deltaY || deltaX, shiftKey, deltaMode, x, y });
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
        onClick={clickHandler}
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
      if (state.step === 'end') {
        return {
          ...state,
          step: 'initial',
        };
      }
      return state;
    default:
      return state;
  }
}
