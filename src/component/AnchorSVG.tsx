import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  RefObject,
} from 'react';
import { useRef, useState } from 'react';

type CursorOrientation = 'horizontal' | 'vertical';

const CUR_MOVE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='12' viewBox='0 0 22 12'%3E%3Cpath d='M1 6h20M1 6l4-4M1 6l4 4M21 6l-4-4M21 6l-4 4' fill='none' stroke='black' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 11 6, ew-resize`;
const CUR_MOVE_VERTICAL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='22' viewBox='0 0 12 22'%3E%3Cpath d='M6 1v20M6 1l-4 4M6 1l4 4M6 21l-4-4M6 21l4-4' fill='none' stroke='black' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 6 11, ns-resize`;
type AnchorShape = 'diamond' | 'circle' | 'square' | 'triangle';

interface AnchorStyle {
  size?: number;
  hoverSize?: number;
  dragSize?: number;
  fill?: string;
  stroke?: string;
  hoverFill?: string;
  hoverStroke?: string;
  dragFill?: string;
  dragStroke?: string;
  strokeWidth?: number;
  guideColor?: string;
  guideDragColor?: string;
  guideStyle?: 'solid' | 'dashed' | 'dotted';
}

interface AnchorPosition {
  x: number;
  y: number;
}

interface AnchorProps {
  position: AnchorPosition;
  shape?: AnchorShape;
  svgRef: RefObject<SVGSVGElement>;
  svgHeight: number;
  anchorStyle?: AnchorStyle;
  restoreFocusOnLeave?: boolean;
  onDragMove: (newPosition: AnchorPosition) => void;
  onDragEnd: (lastPosition: AnchorPosition) => void;
  onDelete: () => void;
  cursorOrientation?: CursorOrientation;
}

interface DragState {
  startX: number;
  startY: number;
  startAnchorX: number;
  startAnchorY: number;
}

type InteractionState = 'idle' | 'hovered' | 'dragging';

interface VisualTokens {
  fill: string;
  stroke: string;
  cursor: string;
}

function resolveVisuals(
  state: InteractionState,
  idleFill: string,
  idleStroke: string,
  hoverFill: string,
  hoverStroke: string,
  dragFill: string,
  dragStroke: string,
  cursorOrientation: CursorOrientation,
): VisualTokens {
  const cursor =
    cursorOrientation === 'horizontal' ? CUR_MOVE : CUR_MOVE_VERTICAL;
  if (state === 'dragging') {
    return {
      fill: dragFill,
      stroke: dragStroke,
      cursor,
    };
  }

  if (state === 'hovered') {
    return {
      fill: hoverFill,
      stroke: hoverStroke,
      cursor,
    };
  }

  return {
    fill: idleFill,
    stroke: idleStroke,
    cursor: 'default',
  };
}

function clientToSvg(
  event: MouseEvent<SVGGElement>,
  svg: SVGSVGElement | null,
): { x: number; y: number } {
  const { clientX, clientY } = event;
  if (!svg) return { x: clientX, y: clientY };

  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;

  const ctm = svg.getScreenCTM();

  if (!ctm) return { x: clientX, y: clientY };

  return pt.matrixTransform(ctm.inverse());
}

interface ShapeRendererProps {
  shape?: AnchorShape;
  fill: string;
  stroke: string;
  strokeWidth: number;
  size: number;
}

function ShapeRenderer({
  shape,
  fill,
  stroke,
  strokeWidth,
  size,
}: ShapeRendererProps) {
  const half = size / 2;
  const inset = strokeWidth / 2;

  const common: CSSProperties = {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.14))',
    pointerEvents: 'all',
  };

  if (shape === 'circle') {
    return (
      <circle
        cx={0}
        cy={0}
        r={half - inset}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={common}
      />
    );
  }

  if (shape === 'diamond') {
    return (
      <polygon
        points={`
          0,-${half - inset}
          ${half - inset},0
          0,${half - inset}
          -${half - inset},0
        `}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        style={common}
      />
    );
  }

  if (shape === 'triangle') {
    return (
      <polygon
        points={`
          0,-${half - inset}
          ${half - inset},${half - inset}
          -${half - inset},${half - inset}
        `}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        style={common}
      />
    );
  }

  return (
    <rect
      x={-half + inset}
      y={-half + inset}
      width={size - strokeWidth}
      height={size - strokeWidth}
      rx={1}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={common}
    />
  );
}

export function Anchor({
  position,
  shape,
  svgRef,
  svgHeight,
  anchorStyle = {},
  restoreFocusOnLeave = false,
  onDragMove,
  onDragEnd,
  onDelete,
  cursorOrientation = 'horizontal',
}: AnchorProps) {
  const {
    size = 16,
    hoverSize = size,
    dragSize = size,
    fill: idleFill = '#ffffff',
    stroke: idleStroke = '#d1d5db',
    hoverFill = '#f3f4f6',
    hoverStroke = '#9ca3af',
    dragFill = '#f3f4f6',
    dragStroke = '#6b7280',
    strokeWidth = 1,
    guideColor = 'rgba(156,163,175,0.6)',
    guideDragColor = 'rgba(107,114,128,0.8)',
    guideStyle = 'solid',
  } = anchorStyle;

  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const dragState = useRef<DragState | null>(null);
  const prevFocus = useRef<Element | null>(null);

  const interactionState: InteractionState = dragging
    ? 'dragging'
    : hovered
      ? 'hovered'
      : 'idle';

  const { fill, stroke, cursor } = resolveVisuals(
    interactionState,
    idleFill,
    idleStroke,
    hoverFill,
    hoverStroke,
    dragFill,
    dragStroke,
    cursorOrientation,
  );

  function handleMouseDown(e: MouseEvent<SVGGElement>) {
    e.preventDefault();
    setDragging(true);
    const { x, y } = clientToSvg(e, svgRef.current);
    dragState.current = {
      startX: x,
      startY: y,
      startAnchorX: position.x,
      startAnchorY: position.y,
    };

    const onMove = (e: globalThis.MouseEvent) => {
      const current = dragState.current;
      if (!current) return;
      const { x, y } = clientToSvg(
        e as unknown as MouseEvent<SVGGElement>,
        svgRef.current,
      );
      const newX = current.startAnchorX + x - current.startX;
      const newY = current.startAnchorY + y - current.startY;

      onDragMove({ x: newX, y: newY });
    };

    const onUp = () => {
      setDragging(false);
      dragState.current = null;
      onDragEnd({ x: position.x, y: position.y });

      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function handleKeyDown(e: KeyboardEvent<SVGGElement>) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onDelete();
    }
  }

  function handleMouseEnter(e: MouseEvent<SVGGElement>) {
    setHovered(true);
    prevFocus.current = document.activeElement;
    e.currentTarget.focus();
  }

  function handleMouseLeave(e: MouseEvent<SVGGElement>) {
    setHovered(false);

    if (restoreFocusOnLeave && prevFocus.current instanceof HTMLElement) {
      prevFocus.current.focus();
    } else {
      e.currentTarget.blur();
    }

    prevFocus.current = null;
  }

  return (
    <>
      {(hovered || dragging) && (
        <line
          x1={position.x}
          y1={0}
          x2={position.x}
          y2={svgHeight}
          stroke={dragging ? guideDragColor : guideColor}
          strokeWidth={1}
          strokeDasharray={
            guideStyle === 'dashed'
              ? '6 4'
              : guideStyle === 'dotted'
                ? '1 3'
                : undefined
          }
          pointerEvents="none"
        />
      )}

      <g
        transform={`translate(${position.x} ${position.y})`}
        style={{
          cursor,
          outline: 'none',
        }}
        tabIndex={0}
        data-self-control="true"
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
      >
        {(hovered || dragging) && (
          <circle
            r={(hovered ? hoverSize : dragSize) * 1.5}
            fill={stroke}
            opacity={dragging ? 0.2 : 0.15}
            pointerEvents="none"
          />
        )}

        <ShapeRenderer
          shape={shape}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          size={hovered ? hoverSize : dragging ? dragSize : size}
        />
      </g>
    </>
  );
}
