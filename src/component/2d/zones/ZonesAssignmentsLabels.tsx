import styled from '@emotion/styled';
import type { Spectrum2D } from '@zakodium/nmrium-core';
import type { Zone, Zones as ZonesType } from 'nmr-processing';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PiTextTSlash } from 'react-icons/pi';

import { FieldEdition } from '../../1d-2d/FieldEdition.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import { SVGButton } from '../../elements/SVGButton.js';
import { SVGGroup } from '../../elements/SVGGroup.js';
import type { Position } from '../../elements/draggable/useDraggable.js';
import useDraggable from '../../elements/draggable/useDraggable.js';
import { useHighlight } from '../../highlight/index.js';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { getTracesSpectra } from '../useTracesSpectra.js';
import type { GetTracesSpectraOptions } from '../useTracesSpectra.js';
import { extractSpectrumSignals } from '../utilities/extractSpectrumSignals.js';
import type { BaseSignal } from '../utilities/extractSpectrumSignals.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

interface ZonesInnerProps {
  zones: ZonesType;
}

interface AssignmentLabelProps {
  zone: Zone;
}

const distance = 30;
const iconSize = 16;
const LabelBoxPadding = { left: 35, right: 0, top: 15, bottom: 15 };

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
      const angle = Number(
        getAngleFromSides(deltaLength, aLength, bLength).toFixed(1),
      );

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
  sourceElementBoundary: Boundary,
  options: { sideLength?: number; shift?: number } = {},
) {
  const { sideLength = 6, shift = 5 } = options;

  const { x1, x2, y1, y2 } = targetBoundary;
  const { x, y } = currentPosition;
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  const { width, height } = sourceElementBoundary;
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

  /**
   * Zone coordination
   *  xMid= x2-x1/2;
   *  yMid= y2-y1/2;
   * (x1,y1)     ----------  (xMid,y1)  ---------- (x2,y1)
   *    |                                             |
   *    |                                             |
   * (x1,yMid)                                    (x2,yMid)
   *    |                                             |
   *    |                                             |
   * (x1,y2)    ----------   (xMid,y2) ----------  (x2,y2)
   *
   */

  const targetPoints: Position[] = [
    {
      //Left Top
      x: scaleX(x1),
      y: scaleY(y1),
    },
    {
      //Center Top
      x: targetXCenter,
      y: scaleY(y1),
    },
    {
      //Right Top
      x: scaleX(x2),
      y: scaleY(y1),
    },
    {
      //Right Center
      x: scaleX(x2),
      y: targetYCenter,
    },
    {
      //Right Bottom
      x: scaleX(x2),
      y: scaleY(y2),
    },
    {
      //Center Bottom
      x: targetXCenter,
      y: scaleY(y2),
    },

    {
      //Left Bottom
      x: scaleX(x1),
      y: scaleY(y2),
    },
    {
      //Left Center
      x: scaleX(x1),
      y: targetYCenter,
    },
  ];

  const link = findBestLink(sourcePoints, targetPoints);

  return `${link.sourcePoint.a.x},${link.sourcePoint.a.y} ${link.sourcePoint.b.x},${link.sourcePoint.b.y} ${link.targetPoint.x},${link.targetPoint.y}`;
}

const GroupContainer = styled.g<{ isMoveActive: boolean }>(
  ({ isMoveActive }) =>
    !isMoveActive
      ? `

      pointer-events: bounding-box;

.target {
  visibility: hidden;
}

&:hover {
  .target {
    visibility: visible;
  }
}
`
      : ``,
);

interface Boundary {
  width: number;
  height: number;
}

interface GetDefaultAssignmentOptions extends GetTracesSpectraOptions {
  zone: Zone;
}

function findClosestAssignment(signals: BaseSignal[], target: number) {
  if (signals.length === 0) return '';
  let closest = signals[0];
  let minDiff = Math.abs(closest.delta - target);

  for (let i = 1; i < signals.length; i++) {
    const { delta } = signals[i];
    const diff = Math.abs(delta - target);
    if (diff < minDiff) {
      closest = signals[i];
      minDiff = diff;
    }
  }

  return closest.assignment || '';
}

function getAssignmentLabel(
  spectrum,
  options: { from: number; to: number; center: number },
) {
  if (!spectrum) return null;
  const { center, from, to } = options;
  const signalList = extractSpectrumSignals(spectrum, { from, to }).sort(
    (a, b) => a.delta - b.delta,
  );
  return findClosestAssignment(signalList, center);
}

function getDefaultAssignmentLabel(options: GetDefaultAssignmentOptions) {
  const { zone, activeSpectra, nuclei, spectra } = options;
  const { signals, x, y } = zone;
  if (signals.length === 0) return '';

  const [topSpectrum, leftSpectrum] = getTracesSpectra({
    activeSpectra,
    nuclei,
    spectra,
  });

  const centerX = x.from + x.to / 2;
  const centerY = y.from + y.to / 2;

  const xLabel = getAssignmentLabel(topSpectrum, {
    from: x.from,
    to: x.to,
    center: centerX,
  });
  const yLabel = getAssignmentLabel(leftSpectrum, {
    from: y.from,
    to: y.to,
    center: centerY,
  });

  if (nuclei[0] === nuclei[1] && xLabel === yLabel) {
    return xLabel || '';
  }

  return [xLabel, yLabel].filter(Boolean).join(',');
}

function AssignmentLabel(props: AssignmentLabelProps) {
  const { zone } = props;
  const {
    data: spectra,
    view: {
      spectra: { activeTab, activeSpectra },
    },
  } = useChartData();
  const { id, x, y } = zone;
  let { assignment } = zone;
  const dispatch = useDispatch();
  const { isActive } = useHighlight([zone.id]);
  const { assignmentsLabelsCoordinates } = useActiveSpectrumZonesViewState();
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const { viewerRef } = useGlobal();
  const textRef = useRef<SVGTextElement>(null);
  const [labelBoundary, setLabelBoundary] = useState<Boundary>({
    width: 0,
    height: 0,
  });
  const [isMoveActive, setIsMoveActive] = useState(false);
  const {
    data: newAssignmentLabelState,
    setData: updateNewAssignmentLabelState,
  } = useShareData<{ id: string } | null>();

  function dismissNewLabel() {
    if (newAssignmentLabelState) {
      updateNewAssignmentLabelState(null);
    }
  }

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

  useLayoutEffect(() => {
    if (textRef.current) {
      const { width, height } = textRef.current.getBBox();
      setLabelBoundary({ width, height });
    }
  }, [assignment]);

  const { onPointerDown } = useDraggable({
    position: coordinate,
    onChange: (dragEvent) => {
      const { action, position } = dragEvent;
      const boundary = textRef.current?.getBBox();

      if (!boundary) return;
      const centerX = width / 2 + LabelBoxPadding.left;
      const centerY = height + iconSize;

      switch (action) {
        case 'start': {
          setCurrentPosition({ x: position.x, y: position.y });
          setIsMoveActive(true);

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
          setIsMoveActive(false);
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
    labelBoundary,
  );

  if (!assignment && newAssignmentLabelState?.id !== id) {
    return null;
  }

  function handleChange(value: string) {
    dismissNewLabel();

    dispatch({
      type: 'CHANGE_ZONE_ASSIGNMENT_LABEL',
      payload: {
        value,
        zoneID: id,
      },
    });
  }

  const { width, height } = labelBoundary;

  if (!assignment && activeSpectra) {
    const nuclei = activeTab.split(',');
    assignment = getDefaultAssignmentLabel({
      zone,
      spectra,
      nuclei,
      activeSpectra,
    });
  }

  return (
    <GroupContainer isMoveActive={isMoveActive}>
      <polygon points={path} fill={isActive ? '#ff6f0091' : 'black'} />

      <g
        style={{
          transform: `translate(${currentPosition.x}px,${currentPosition.y}px)`,
        }}
      >
        <rect
          data-no-export="true"
          fill="transparent"
          x={-(width / 2 + LabelBoxPadding.left)}
          width={width + LabelBoxPadding.left + LabelBoxPadding.right}
          height={height + LabelBoxPadding.top + LabelBoxPadding.bottom}
          y={-(height + LabelBoxPadding.top)}
        />
        <FieldEdition
          onChange={handleChange}
          inputType="text"
          value={assignment || ''}
          PopoverProps={{
            position: 'top',
            targetTagName: 'g',
            ...(newAssignmentLabelState?.id === id
              ? { isOpen: true, onClose: () => dismissNewLabel() }
              : {}),
          }}
        >
          <text
            fontWeight={isActive ? 'bold' : 'normal'}
            ref={textRef}
            textAnchor="middle"
            fill="black"
            style={{ cursor: 'hand' }}
          >
            {assignment}
          </text>
        </FieldEdition>
        <SVGGroup
          space={2}
          data-no-export="true"
          transform={`translate(-${width / 2 + iconSize * 2 + 2} -${height + iconSize})`}
          className="target"
        >
          <SVGButton
            title="Move label"
            size={iconSize}
            icon="move"
            onPointerDown={onPointerDown}
            style={{ cursor: 'move' }}
          />
          <SVGButton
            size={iconSize}
            title="Remove label"
            renderIcon={(props) => <PiTextTSlash {...props} />}
            backgroundColor="red"
            style={{ cursor: 'hand' }}
            onClick={() => handleChange('')}
          />
        </SVGGroup>
      </g>
    </GroupContainer>
  );
}

function ZonesAssignmentsLabelsInner({ zones }: ZonesInnerProps) {
  return (
    <g className="2d-zones-assignments-labels">
      {zones.values.map((zone) => (
        <AssignmentLabel key={zone.id} zone={zone} />
      ))}
    </g>
  );
}

const emptyData = { zones: {}, display: {} };

export default function ZonesAssignmentsLabels() {
  const { zones, display } = useSpectrum(emptyData) as Spectrum2D;
  const { showAssignmentsLabels } = useActiveSpectrumZonesViewState();
  const { data: NewAssignmentLabelState } = useShareData();
  if (
    (!display.isVisible || !showAssignmentsLabels) &&
    !NewAssignmentLabelState
  ) {
    return null;
  }

  return <ZonesAssignmentsLabelsInner {...{ zones }} />;
}
