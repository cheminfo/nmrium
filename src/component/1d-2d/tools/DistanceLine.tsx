import styled from '@emotion/styled';
import { clamp } from '@zakodium/utils';

import { useBrushTracker } from '../../EventsTrackers/BrushTracker.tsx';
import { useChartData } from '../../context/ChartContext.tsx';
import {
  useIsPrimaryKeyActivated,
  useKeyModifiers,
} from '../../context/KeyModifierContext.tsx';
import { useIndicatorLineColor } from '../../hooks/useIndicatorLineColor.ts';
import type { Margin } from '../../reducer/Reducer.ts';
import type { Tool } from '../../toolbar/ToolTypes.ts';

interface CrossLineProps {
  markerSize: number;
  startX: number;
  startY: number;
  reflectX?: boolean;
  color?: string;
}

const AbsoluteDiv = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
`;

const Container = styled(AbsoluteDiv)`
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
`;
const CrossLine = styled(AbsoluteDiv)<CrossLineProps>`
  width: ${({ markerSize }) => markerSize * 2}px;
  height: 1px;
  background-color: ${({ color }) => color || 'black'};
  transform-origin: 50% 50%;
  transform: translate(
      ${({ startX, markerSize }) => startX - markerSize}px,
      ${({ startY }) => startY}px
    )
    rotate(${({ reflectX }) => (reflectX ? '-' : '')}45deg);
`;

const allowTools = new Set<Tool>(['alignTwoDimensionsSpectra']);

interface BrushCoordinates {
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
}
const defaultDimensionBorder: BrushCoordinates = {
  startX: 0,
  startY: 0,
};

interface BrushXYProps {
  dimensionBorder?: BrushCoordinates;
  width?: number;
  height?: number;
  margin?: Margin;
  markerSize?: number;
}

interface Point {
  x: number;
  y: number;
}

interface Boundary {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function resolveBoundary(
  dimensionBorder: BrushCoordinates,
  fallbackWidth: number,
  fallbackHeight: number,
): Boundary {
  return {
    minX: dimensionBorder.startX,
    minY: dimensionBorder.startY,
    maxX: dimensionBorder.endX ?? fallbackWidth,
    maxY: dimensionBorder.endY ?? fallbackHeight,
  };
}

function isPointWithinBoundary(point: Point, boundary: Boundary): boolean {
  return (
    point.x >= boundary.minX &&
    point.x <= boundary.maxX &&
    point.y >= boundary.minY &&
    point.y <= boundary.maxY
  );
}

function clampPointToBoundary(point: Point, boundary: Boundary): Point {
  const { minX, minY, maxX, maxY } = boundary;
  const { x, y } = point;
  return {
    x: clamp(x, minX, maxX),
    y: clamp(y, minY, maxY),
  };
}

function alignToDominantAxis(options: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}): Point {
  const { startX, startY, endX, endY } = options;
  const dx = endX - startX;
  const dy = endY - startY;
  const isHorizontal = Math.abs(dx) > Math.abs(dy);

  return {
    x: isHorizontal ? endX : startX,
    y: isHorizontal ? startY : endY,
  };
}

interface GetAlignedPointOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  altKey: boolean;
}
interface GetAlignPointerEndPointOptions extends GetAlignedPointOptions {
  boundary: Boundary;
}

export function getAlignedPoint(options: GetAlignedPointOptions): Point {
  const { startX, startY, endX, endY, altKey } = options;

  if (altKey) {
    return alignToDominantAxis({ startX, startY, endX, endY });
  }

  return { x: endX, y: endY };
}

function getAlignPointerEndPoint(
  options: GetAlignPointerEndPointOptions,
): Point | null {
  const { startX, startY, endX, endY, altKey, boundary } = options;

  if (!isPointWithinBoundary({ x: endX, y: endY }, boundary)) {
    return null;
  }

  return getAlignedPoint({ startX, startY, endX, endY, altKey });
}

export function DistanceLine(options: BrushXYProps) {
  const {
    dimensionBorder = defaultDimensionBorder,
    width: widthProps,
    height: heightProps,
    margin: externalMargin,
    markerSize = 6,
  } = options;
  const {
    toolOptions: { selectedTool },
    margin: innerMargin,
    width,
    height,
  } = useChartData();

  const margin = externalMargin ?? innerMargin;
  const brushTracker = useBrushTracker();
  const { step, mouseButton } = brushTracker;
  const { startX, endX, startY, endY } = brushTracker;
  const { altKey } = useKeyModifiers();
  const indicatorColor = useIndicatorLineColor();
  const finalWidth = widthProps || width - margin.left - margin.right;
  const finalHeight = heightProps || height - margin.top - margin.bottom;

  const boundary = resolveBoundary(dimensionBorder, finalWidth, finalHeight);
  const isPrimaryKeyActivated = useIsPrimaryKeyActivated();

  const startPoint: Point = { x: startX, y: startY };

  if (
    !allowTools.has(selectedTool) ||
    !isPrimaryKeyActivated ||
    step !== 'brushing' ||
    mouseButton !== 'main' ||
    !isPointWithinBoundary(startPoint, boundary)
  ) {
    return null;
  }

  const alignedEndPoint = getAlignPointerEndPoint({
    startX,
    startY,
    endX,
    endY,
    altKey,
    boundary,
  });

  const { x: finalEndX, y: finalEndY } =
    alignedEndPoint ?? clampPointToBoundary({ x: endX, y: endY }, boundary);

  const dx = finalEndX - startX;
  const dy = finalEndY - startY;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const strokeWidth = 2;

  return (
    <Container>
      {/* distance line*/}
      <AbsoluteDiv
        style={{
          width: 1,
          height: strokeWidth,
          backgroundColor: indicatorColor,
          borderRadius: strokeWidth / 2,
          transformOrigin: '0% 50%',
          transform: `translate(${startX}px, ${startY - strokeWidth / 2}px) rotate(${angle}deg) scaleX(${length})`,
        }}
      />

      {/* X marker at start point */}
      <CrossLine startX={startX} startY={startY} markerSize={markerSize} />
      <CrossLine
        startX={startX}
        startY={startY}
        markerSize={markerSize}
        reflectX
      />

      {/* end point circle */}
      <AbsoluteDiv
        style={{
          width: markerSize,
          height: markerSize,
          borderRadius: '50%',
          backgroundColor: indicatorColor,
          transform: `translate(${finalEndX - markerSize / 2}px, ${finalEndY - markerSize / 2}px)`,
        }}
      />
    </Container>
  );
}
