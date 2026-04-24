import styled from '@emotion/styled';
import { useRef, useState } from 'react';

const CUR_MOVE = `url("position:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='12' viewBox='0 0 22 12'%3E%3Cpath d='M1 6h20M1 6l4-4M1 6l4 4M21 6l-4-4M21 6l-4 4' fill='none' stroke='black' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 11 6, ew-resize`;

type AnchorShape = 'diamond' | 'circle' | 'square' | 'triangle';

interface AnchorStyle {
  /** Shape size in px. Default: 16 */
  size?: number;
  /** Default: "rgba(255,255,255,0.85)" */
  fill?: string;
  /** Default: "#7a8fa6" */
  stroke?: string;
  /** Default: "rgba(210,220,235,0.6)" */
  hoverFill?: string;
  /** Default: "#7a8fa6" */
  hoverStroke?: string;
  /** Default: "rgba(210,220,235,0.8)" */
  dragFill?: string;
  /** Default: "#7a8fa6" */
  dragStroke?: string;
  /** Stroke width in px. Default: 1.2 */
  strokeWidth?: number;
  /** Default: "rgba(74,111,168,0.5)" */
  guideColor?: string;
  /** Default: "rgba(42,82,160,0.75)" */
  guideDragColor?: string;
  /** Default: "solid" */
  guideStyle?: 'dashed' | 'dotted' | 'solid';
}

interface AnchorPosition {
  x: number;
  y: number;
}

interface AnchorProps {
  position: AnchorPosition;
  shape?: AnchorShape;
  containerRef: React.RefObject<HTMLElement>;
  anchorStyle?: AnchorStyle;
  restoreFocusOnLeave?: boolean;
  onDragMove: (newX: number) => void;
  onDragEnd: (lastX: number) => void;
  onDelete: () => void;
}

interface DragState {
  startX: number;
  startAnchorX: number;
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
): VisualTokens {
  if (state === 'dragging') {
    return { fill: dragFill, stroke: dragStroke, cursor: CUR_MOVE };
  }
  if (state === 'hovered') {
    return { fill: hoverFill, stroke: hoverStroke, cursor: CUR_MOVE };
  }
  return { fill: idleFill, stroke: idleStroke, cursor: 'default' };
}

const AnchorItem = styled.div<{ cursor: string }>`
  position: absolute;
  cursor: ${({ cursor }) => cursor};
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  pointer-events: all;
`;

const HoverEffect = styled.div<{
  isDragging: boolean;
  stroke: string;
  size: number;
}>`
  position: absolute;
  border-radius: 50%;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: radial-gradient(
    circle,
    ${({ stroke }) => stroke} 0%,
    transparent 50%
  );
  opacity: ${({ isDragging }) => (isDragging ? 0.2 : 0.15)};
  pointer-events: none;
`;

const VerticalGuideLine = styled.div<{ color: string; lineStyle: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  transform: translateX(-50%);
  border-left: 1px ${({ lineStyle }) => lineStyle} ${({ color }) => color};
  pointer-events: none;
  z-index: 0;
`;

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
  strokeWidth: sw,
  size: s,
}: ShapeRendererProps) {
  const half = s / 2;
  const inset = sw / 2;

  const svgProps = {
    width: s,
    height: s,
    viewBox: `0 0 ${s} ${s}`,
    style: {
      display: 'block',
      overflow: 'visible',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.14))',
    } as React.CSSProperties,
  };

  if (shape === 'circle') {
    return (
      <svg {...svgProps}>
        <circle
          cx={half}
          cy={half}
          r={half - inset}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }

  if (shape === 'diamond') {
    const pts = [
      `${half},${inset}`,
      `${s - inset},${half}`,
      `${half},${s - inset}`,
      `${inset},${half}`,
    ].join(' ');
    return (
      <svg {...svgProps}>
        <polygon
          points={pts}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shape === 'triangle') {
    const pts = [
      `${half},${inset}`,
      `${s - inset},${s - inset}`,
      `${inset},${s - inset}`,
    ].join(' ');
    return (
      <svg {...svgProps}>
        <polygon
          points={pts}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...svgProps}>
      <rect
        x={inset}
        y={inset}
        width={s - sw}
        height={s - sw}
        rx={1}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />
    </svg>
  );
}

function clientXToElementX(clientX: number, el: HTMLElement | null): number {
  return el ? clientX - el.getBoundingClientRect().left : clientX;
}

export function Anchor({
  position,
  shape,
  containerRef,
  anchorStyle = {},
  restoreFocusOnLeave = false,
  onDragMove,
  onDragEnd,
  onDelete,
}: AnchorProps) {
  const {
    size = 16,
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
  );

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
    dragState.current = {
      startX: clientXToElementX(e.clientX, containerRef.current),
      startAnchorX: position.x,
    };

    const onMove = (ev: MouseEvent) => {
      const current = dragState.current;
      if (!current) return;

      const x =
        current.startAnchorX +
        clientXToElementX(ev.clientX, containerRef.current) -
        current.startX;

      onDragMove(x);
    };

    const onUp = () => {
      setDragging(false);
      dragState.current = null;
      onDragEnd(position.x);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      onDelete();
    }
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    setHovered(true);
    prevFocus.current = document.activeElement;
    e.currentTarget.focus();
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
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
        <VerticalGuideLine
          color={dragging ? guideDragColor : guideColor}
          lineStyle={guideStyle}
          style={{
            transform: `translateX(${position.x}px)`,
            willChange: 'transform',
          }}
        />
      )}

      <AnchorItem
        cursor={cursor}
        style={{
          transform: `translate(calc(${position.x}px - 50%), calc(${position.y}px - 50%))`,
          willChange: 'transform',
        }}
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
      >
        {(hovered || dragging) && (
          <HoverEffect stroke={stroke} isDragging={dragging} size={size * 4} />
        )}

        <ShapeRenderer
          shape={shape}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          size={size}
        />
      </AnchorItem>
    </>
  );
}
