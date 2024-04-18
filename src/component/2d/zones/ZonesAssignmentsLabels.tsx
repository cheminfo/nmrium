import { Spectrum2D } from 'nmr-load-save';
import { Zone, Zones as ZonesType } from 'nmr-processing';
import { memo, useEffect, useRef, useState } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
import useDraggable from '../../elements/draggable/useDraggable';
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

  if (!assignment) {
    return null;
  }

  const centerPosition = scaleX(x.to) + (scaleX(x.from) - scaleX(x.to)) / 2;

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

      <polygon
        points={`${currentPosition.x},${currentPosition.y} ${currentPosition.x + 6},${currentPosition.y} ${centerPosition},${scaleY(y.from)}`}
        fill={isActive ? '#ff6f0091' : 'black'}
      />
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
