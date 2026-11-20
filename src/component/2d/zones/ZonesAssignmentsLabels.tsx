import styled from '@emotion/styled';
import type { Signal2D, Zone, Zones as ZonesType } from '@zakodium/nmr-types';
import type { Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PiTextTSlash } from 'react-icons/pi';

import { FieldEdition } from '../../1d-2d/FieldEdition.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import { SVGButton } from '../../elements/SVGButton.js';
import { SVGGroup } from '../../elements/SVGGroup.js';
import useDraggable from '../../elements/draggable/useDraggable.js';
import { useHighlight } from '../../highlight/index.js';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import type { GetTracesSpectraOptions } from '../useTracesSpectra.js';
import { getTracesSpectra } from '../useTracesSpectra.js';
import { getClosestSignal } from '../utilities/extractSpectrumSignals.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';
import { useAssignmentLabelLinkPath } from '../utilities/useAssignmentLabelLinkPath.js';

interface ZonesInnerProps {
  zones: ZonesType;
}

interface AssignmentLabelProps {
  zone: Zone;
  signal: Signal2D;
}

const distance = 30;
const iconSize = 16;
const LabelBoxPadding = { left: 35, right: 0, top: 15, bottom: 15 };

const GroupContainer = styled.g<{ isMoveActive: boolean }>(
  ({ isMoveActive }) =>
    !isMoveActive
      ? `

      pointer-events: bounding-box;

.target {
  visibility: hidden;
}

:hover {
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

function getAssignmentLabel(
  spectrum: Spectrum1D | null,
  options: { from: number; to: number; center: number },
) {
  if (!spectrum) return null;
  return getClosestSignal(spectrum, options)?.assignment || '';
}

function getDefaultAssignmentLabel(options: GetDefaultAssignmentOptions) {
  const { zone, activeSpectra, nuclei, spectra } = options;
  const { signals, x, y } = zone;
  if (signals.length === 0) return '';

  const { x: topSpectrum, y: leftSpectrum } = getTracesSpectra({
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
  const { zone, signal } = props;
  const {
    data: spectra,
    view: {
      spectra: { activeTab, activeSpectra },
    },
  } = useChartData();
  const { id: zoneID, x, y } = zone;
  let assignment = signal.assignment;
  const { id: signalID } = signal;
  const dispatch = useDispatch();
  const { isActive } = useHighlight([signalID]);
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

  if (assignmentsLabelsCoordinates?.[signalID]) {
    coordinate = {
      x: scaleX(assignmentsLabelsCoordinates[signalID].x),
      y: scaleY(assignmentsLabelsCoordinates[signalID].y),
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
              signalID,
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
  const path = useAssignmentLabelLinkPath(
    currentPosition,
    { x1: x.to, x2: x.from, y1: y.from, y2: y.to },
    labelBoundary,
  );

  if (!assignment && newAssignmentLabelState?.id !== signalID) {
    return null;
  }

  function handleChange(value: string) {
    dismissNewLabel();

    dispatch({
      type: 'CHANGE_ZONE_ASSIGNMENT_LABEL',
      payload: {
        value,
        zoneID,
        signalID,
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
            placement: 'top',
            targetTagName: 'g',
            ...(newAssignmentLabelState?.id === signalID && {
              isOpen: true,
              onClose: () => dismissNewLabel(),
            }),
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
      {zones.values.map((zone) => {
        const { signals = [] } = zone;
        return signals.map((signal) => (
          <AssignmentLabel key={signal.id} zone={zone} signal={signal} />
        ));
      })}
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

  return <ZonesAssignmentsLabelsInner zones={zones} />;
}
