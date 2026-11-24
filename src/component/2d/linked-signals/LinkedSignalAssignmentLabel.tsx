import styled from '@emotion/styled';
import { isSpectrum2D } from '@zakodium/nmrium-core';
import { useLayoutEffect, useRef, useState } from 'react';
import { PiTextTSlash } from 'react-icons/pi';
import { Button } from 'react-science/ui';

import { FieldEdition } from '../../1d-2d/FieldEdition.js';
import { disableMouseTrackingProps } from '../../EventsTrackers/MouseTracker.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import { SVGButton } from '../../elements/SVGButton.js';
import type { Position } from '../../elements/draggable/useDraggable.js';
import useDraggable from '../../elements/draggable/useDraggable.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { useExtractAtomAssignmentLabel } from '../../panels/MoleculesPanel/hooks/useExtractAtomAssignmentLabel.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';
import { useAssignmentLabelLinkPath } from '../utilities/useAssignmentLabelLinkPath.js';

import type { PositionedLinkedSignal } from './utilities/signalCrossings.js';
import { getCrossingAssignmentLabel } from './utilities/signalCrossings.js';

const LabelContainer = styled.g<{ isMoving: boolean }>`
  pointer-events: bounding-box;

  .controls {
    visibility: ${({ isMoving }) => (isMoving ? 'visible' : 'hidden')};
  }

  &:hover .controls {
    visibility: visible;
  }
`;

interface LinkedSignalAssignmentLabelProps {
  signal: PositionedLinkedSignal;
  color: string;
}

export function LinkedSignalAssignmentLabel({
  signal,
  color,
}: LinkedSignalAssignmentLabelProps) {
  const { xSignalId, ySignalId, assignment, isAutoAssignment } = signal;
  const id = `${xSignalId}:${ySignalId}`;
  const hasLink = signal.xDiaIDs.length > 0 || signal.yDiaIDs.length > 0;
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const dispatch = useDispatch();
  const { getAssignmentLabelByDiaIDs } = useExtractAtomAssignmentLabel();
  const { viewerRef } = useGlobal();
  const { data: newLabel, setData: setNewLabel } = useShareData<
    string | null
  >();
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [labelBoundary, setLabelBoundary] = useState({ width: 0, height: 0 });
  const moveOffset = { x: labelBoundary.width / 2 + 24, y: 18 };

  useLayoutEffect(() => {
    if (textRef.current) {
      const { width, height } = textRef.current.getBBox();
      setLabelBoundary({ width, height });
    }
  }, [assignment]);

  const { coordinate, position, path, spectrum } =
    useLinkedSignalAssignmentLabelPosition({
      id,
      signal,
      dragPosition,
      labelBoundary,
    });
  const isNewLabel = newLabel === id;
  const { onPointerDown } = useDraggable({
    position: coordinate,
    parentElement: viewerRef,
    onChange: ({ action, position }) => {
      if (action === 'start') {
        setDragPosition(coordinate);
      } else if (action === 'move' || action === 'end') {
        const nextPosition = {
          x: position.x + moveOffset.x,
          y: position.y + moveOffset.y,
        };
        if (action === 'move') {
          setDragPosition(nextPosition);
        } else {
          if (!spectrum) return;

          dispatch({
            type: 'SET_LINKED_SIGNAL_ASSIGNMENT_LABEL_COORDINATION',
            payload: {
              spectrumId: spectrum.id,
              id,
              coordination: {
                x: scaleX.invert(nextPosition.x),
                y: scaleY.invert(nextPosition.y),
              },
            },
          });
          setDragPosition(null);
        }
      }
    },
  });

  if (!assignment && !isNewLabel) return null;

  function handleChange(value: string) {
    if (isNewLabel) setNewLabel(null);
    dispatch({
      type: 'CHANGE_LINKED_SIGNAL_ASSIGNMENT_LABEL',
      payload: { id, value },
    });
  }

  function handleAssignmentLabel() {
    if (!hasLink) return;

    const isAutoAssignment = !signal.isAutoAssignment;
    let value = signal.assignment ?? '';

    if (isAutoAssignment) {
      const autoLabel = getCrossingAssignmentLabel({
        xAssignment: getAssignmentLabelByDiaIDs(signal.xDiaIDs),
        yAssignment: getAssignmentLabelByDiaIDs(signal.yDiaIDs),
        hasSameNucleus:
          isSpectrum2D(spectrum) &&
          spectrum.info.nucleus[0] === spectrum.info.nucleus[1],
      });
      if (!autoLabel) return;
      value = autoLabel;
    }

    dispatch({
      type: 'CHANGE_LINKED_SIGNAL_ASSIGNMENT_LABEL',
      payload: { id, value, isAutoAssignment },
    });
  }

  return (
    <LabelContainer
      isMoving={dragPosition !== null}
      data-self-control="true"
      {...disableMouseTrackingProps}
      tabIndex={0}
      onMouseEnter={(event) => {
        if (!isNewLabel) event.currentTarget.focus();
      }}
      onMouseLeave={(event) => event.currentTarget.blur()}
    >
      <polygon points={path} fill={color} pointerEvents="none" />
      <g transform={`translate(${position.x} ${position.y})`}>
        <FieldEdition
          onChange={handleChange}
          inputType="text"
          value={assignment || ''}
          rightElement={
            <Button
              variant="minimal"
              icon={isAutoAssignment ? 'link' : 'unlink'}
              onClick={handleAssignmentLabel}
              disabled={!isAutoAssignment && !hasLink}
              tooltipProps={{
                content: isAutoAssignment
                  ? 'Switch to manual assignment'
                  : 'Switch to automatic assignment',
              }}
            />
          }
          PopoverProps={{
            placement: 'top',
            targetTagName: 'g',
            ...(isNewLabel && {
              isOpen: true,
              onClose: () => setNewLabel(null),
            }),
          }}
        >
          <text
            ref={textRef}
            textAnchor="middle"
            fontSize={12}
            fill="black"
            style={{ cursor: 'pointer' }}
          >
            {assignment}
          </text>
        </FieldEdition>
        <g className="controls" data-no-export="true">
          <SVGButton
            x={-moveOffset.x}
            y={-moveOffset.y}
            size={16}
            title="Move label"
            icon="move"
            onPointerDown={onPointerDown}
            style={{ cursor: 'move' }}
          />
          <SVGButton
            x={-moveOffset.x - 24}
            y={-moveOffset.y}
            size={16}
            title="Remove label"
            renderIcon={(props) => <PiTextTSlash {...props} />}
            backgroundColor="red"
            onClick={() => handleChange('')}
          />
        </g>
      </g>
    </LabelContainer>
  );
}

interface UseLinkedSignalAssignmentLabelPositionOptions {
  id: string;
  signal: PositionedLinkedSignal;
  dragPosition: Position | null;
  labelBoundary: { width: number; height: number };
}

function useLinkedSignalAssignmentLabelPosition({
  id,
  signal: { xDelta, yDelta },
  dragPosition,
  labelBoundary,
}: UseLinkedSignalAssignmentLabelPositionOptions) {
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const spectrum = useSpectrum();
  const { view } = useChartData();
  const externalPosition =
    spectrum && view.assignmentsLabelsCoordinates?.[spectrum.id]?.[id];

  const coordinate = externalPosition
    ? { x: scaleX(externalPosition.x), y: scaleY(externalPosition.y) }
    : { x: scaleX(xDelta) + 20, y: scaleY(yDelta) - 30 };
  const position = dragPosition ?? coordinate;
  const path = useAssignmentLabelLinkPath(
    position,
    { x1: xDelta, x2: xDelta, y1: yDelta, y2: yDelta },
    labelBoundary,
  );

  return { coordinate, position, path, spectrum };
}
