import { Spectrum2D } from 'nmr-load-save';
import { Zone, Zones as ZonesType } from 'nmr-processing';
import { memo, useEffect, useRef, useState } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
import useDraggable, { Position } from '../../elements/draggable/useDraggable';
import { useHighlight } from '../../highlight';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState';
import useSpectrum from '../../hooks/useSpectrum';
import { useScale2DX, useScale2DY } from '../utilities/scale';

interface ZonesInnerProps {
  zones: ZonesType;
  displayerKey: string;
}

interface AssignmentLabelProps {
  zone: Zone;
}

const distance = 30;

interface TargetBoundary {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

function getDistance(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  return Math.hypot(deltaX, deltaY);
}

function radiansToDegrees(radians: number) {
  return radians * (180 / Math.PI);
}
function getAngleFromSides(a: number, b: number, c: number) {
  const radians = Math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c));
  return radiansToDegrees(radians);
}

interface FindBestLinkResult {
  sourcePoint: { a: Position; b: Position };
  targetPoint: Position;
  distance: number;
  angle: number;
}

function findBestLink(
  sourcePoints: Array<{ a: Position; b: Position }>,
  targetPoints: Position[],
): FindBestLinkResult {
  const result: FindBestLinkResult[] = [];

  for (const sourcePoint of sourcePoints) {
    const { a, b } = sourcePoint;
    for (const targetPoint of targetPoints) {
      const { x, y } = targetPoint;
      const aLength = getDistance(a.x, a.y, x, y);
      const bLength = getDistance(b.x, b.y, x, y);
      const deltaLength = getDistance(a.x, a.y, b.x, b.y);

      const distance = Math.min(aLength, bLength);
      const angle = getAngleFromSides(deltaLength, aLength, bLength);

      result.push({ distance, angle, targetPoint, sourcePoint });
    }
  }

  result.sort((a, b) => {
    if (a.angle !== b.angle) {
      return b.angle - a.angle;
    } else {
      return a.distance - b.distance;
    }
  });

  return result[0];
}

function useLinkPath(
  currentPosition: Position,
  targetBoundary: TargetBoundary,
  sourceElement: SVGTextElement | null,
  options: { sideLength?: number; shift?: number } = {},
) {
  const { sideLength = 6, shift = 5 } = options;

  const { x1, x2, y1, y2 } = targetBoundary;
  const { x, y } = currentPosition;
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  if (!sourceElement) return;

  const { width, height } = sourceElement.getBBox();
  const centerX = width / 2;
  const centerY = height / 2;
  const leftX = x - centerX - shift;
  const rightX = x + centerX + shift;
  const topY = y - height;
  const bottomY = y + shift;

  const targetWidth = scaleX(x2) - scaleX(x1);
  const targetHeight = scaleY(y2) - scaleY(y1);
  const targetXCenter = scaleX(x1) + targetWidth / 2;
  const targetYCenter = scaleY(y1) + targetHeight / 2;

  const sourcePoints: Array<{ a: Position; b: Position }> = [
    {
      a: { x, y: bottomY },
      b: { x: x + sideLength, y: bottomY },
    },
    {
      a: { x, y: topY },
      b: { x: x + sideLength, y: topY },
    },
    {
      a: { x: leftX, y: y - centerY - sideLength / 2 },
      b: { x: leftX, y: y - centerY + sideLength / 2 },
    },
    {
      a: { x: rightX, y: y - centerY - sideLength / 2 },
      b: { x: rightX, y: y - centerY + sideLength / 2 },
    },
  ];

  const targetPoints: Position[] = [
    {
      x: targetXCenter,
      y: scaleY(y1),
    },
    {
      x: targetXCenter,
      y: scaleY(y1) + targetHeight,
    },
    {
      x: scaleX(x1) + targetWidth,
      y: targetYCenter,
    },
    {
      x: scaleX(x1),
      y: targetYCenter,
    },
  ];

  const link = findBestLink(sourcePoints, targetPoints);

  return `${link.sourcePoint.a.x},${link.sourcePoint.a.y} ${link.sourcePoint.b.x},${link.sourcePoint.b.y} ${link.targetPoint.x},${link.targetPoint.y}`;
}

function AssignmentLabel(props: AssignmentLabelProps) {
  const { zone } = props;
  const { id, x, y, assignment } = zone;
  const dispatch = useDispatch();
  const { isActive } = useHighlight([zone.id]);
  const { assignmentsLabelsCoordinates } = useActiveSpectrumZonesViewState();
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const { viewerRef } = useGlobal();
  const textRef = useRef<SVGTextElement>(null);

  let coordinate = {
    x: scaleX(x.to),
    y: scaleY(y.from) - distance,
  };

  if (assignmentsLabelsCoordinates?.[id]) {
    coordinate = {
      x: scaleX(assignmentsLabelsCoordinates[id].x),
      y: scaleY(assignmentsLabelsCoordinates[id].y),
    };
  }

  const [currentPosition, setCurrentPosition] = useState<{
    x: number;
    y: number;
  }>(coordinate);

  useEffect(() => {
    setCurrentPosition({ x: coordinate.x, y: coordinate.y });
  }, [coordinate.x, coordinate.y]);

  const { onPointerDown } = useDraggable({
    position: coordinate,
    onChange: (dragEvent) => {
      const { action, position } = dragEvent;
      const boundary = textRef.current?.getBBox();

      if (!boundary) return;
      const centerX = boundary.width / 2;
      const centerY = boundary.height / 2;

      switch (action) {
        case 'start': {
          setCurrentPosition({ x: position.x, y: position.y });
          break;
        }
        case 'move': {
          setCurrentPosition({
            x: position.x + centerX,
            y: position.y + centerY,
          });
          break;
        }
        case 'end':
          dispatch({
            type: 'SET_ZONE_ASSIGNMENT_LABEL_COORDINATION',
            payload: {
              zoneID: zone.id,
              coordination: {
                x: scaleX.invert(position.x + centerX),
                y: scaleY.invert(position.y + centerY),
              },
            },
          });
          break;
        default:
          break;
      }
    },
    parentElement: viewerRef,
  });
  const path = useLinkPath(
    currentPosition,
    { x1: x.to, x2: x.from, y1: y.from, y2: y.to },
    textRef.current,
  );

  if (!assignment) {
    return null;
  }

  return (
    <g>
      <text
        ref={textRef}
        style={{
          transform: `translate(${currentPosition.x}px,${currentPosition.y}px)`,
          cursor: 'hand',
        }}
        onPointerDown={onPointerDown}
        textAnchor="middle"
        fill={isActive ? '#ff6f0091' : 'black'}
      >
        {assignment}
      </text>

      <polygon points={path} fill={isActive ? '#ff6f0091' : 'black'} />
    </g>
  );
}

function ZonesAssignmentsLabelsInner({ zones, displayerKey }: ZonesInnerProps) {
  return (
    <g
      clipPath={`url(#${displayerKey}clip-chart-2d)`}
      className="2d-zones-assignments-labels"
    >
      {zones.values.map((zone) => (
        <AssignmentLabel key={zone.id} zone={zone} />
      ))}
    </g>
  );
}

const MemoizedZonesAssignmentsLabels = memo(ZonesAssignmentsLabelsInner);

const emptyData = { zones: {}, display: {} };

export default function ZonesAssignmentsLabels() {
  const { displayerKey } = useChartData();

  const { zones, display } = useSpectrum(emptyData) as Spectrum2D;

  if (!display.isVisible) return null;

  return <MemoizedZonesAssignmentsLabels {...{ zones, displayerKey }} />;
}
