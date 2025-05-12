import styled from '@emotion/styled';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { PiTextTBold, PiTextTSlashBold } from 'react-icons/pi';

import { FieldEdition } from '../../1d-2d/FieldEdition.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import {
  ShareDataProvider,
  useShareData,
} from '../../context/ShareDataContext.js';
import { ActionsButtonsPopover } from '../../elements/ActionsButtonsPopover.js';
import type { ActionsButtonsPopoverProps } from '../../elements/ActionsButtonsPopover.js';
import { useCanvasContext } from '../../hooks/useCanvasContext.js';
import { useTriggerNewAssignmentLabel } from '../../hooks/useTriggerNewAssignmentLabel.js';
import { stackOverlappingLabelsArray } from '../../utility/stackOverlappingLabels.js';
import { useTracesSpectra } from '../useTracesSpectra.js';
import { extractSpectrumSignals } from '../utilities/extractSpectrumSignals.js';
import type { BaseSignal } from '../utilities/extractSpectrumSignals.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

const Rect = styled.rect`
  fill: transparent;

  &:hover {
    fill: #ff6f0057;
  }
`;

const rectSize = 10;
const rectOffset = rectSize / 2;

type IndicationLinesAxis = 'x' | 'y';
interface SignalsGuideLinesProps {
  axis: IndicationLinesAxis;
}

interface IndicationLinesProps extends SignalsGuideLinesProps {
  spectrum: Spectrum1D;
}

const labelSize = 12;
const padding = 2;

interface ProcessedSignal extends BaseSignal {
  labelWidth: number;
  deltaInPixel: number;
}

function useSignalsOverlap(axis: IndicationLinesAxis, spectrum: Spectrum1D) {
  const signals = extractSpectrumSignals(spectrum);
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const context = useCanvasContext(labelSize);

  if (!signals || !context) return null;

  const isOverXAxis = axis === 'x';

  const processedSignals: ProcessedSignal[] = signals
    .map((signal) => {
      const { delta } = signal;
      const text = signal.assignment ?? '';
      const { width: labelWidth } = context.measureText(text);

      return {
        ...signal,
        labelWidth,
        deltaInPixel: isOverXAxis ? scaleX(delta) : scaleY(delta),
      };
    })
    .sort((a, b) => (isOverXAxis ? b.delta - a.delta : a.delta - b.delta));

  return stackOverlappingLabelsArray(processedSignals, {
    startPositionKey: 'deltaInPixel',
    labelWidthKey: 'labelWidth',
    padding,
  });
}

function IndicationLines(props: IndicationLinesProps) {
  const { axis, spectrum } = props;
  const normalizedSignals = useSignalsOverlap(axis, spectrum);

  if (!normalizedSignals) return null;

  return (
    <g>
      {normalizedSignals.map(
        ({ deltaInPixel, stackIndex, assignment, id, rangeId }) => {
          return (
            <IndicationLine
              key={`${axis}[${id}]`}
              {...{ deltaInPixel, stackIndex, assignment, id, rangeId }}
              axis={axis}
              spectrumId={spectrum.id}
            />
          );
        },
      )}
    </g>
  );
}

interface IndicationLineProps {
  deltaInPixel: number;
  stackIndex: number;
  assignment?: string;
  rangeId: string;
  spectrumId: string;
  axis: IndicationLinesAxis;
}

interface GetAxisRangeIdOptions {
  axis: IndicationLinesAxis;
  rangeId: string;
}

function getAxisRangeId(options: GetAxisRangeIdOptions) {
  const { axis, rangeId } = options;
  return `${axis}[${rangeId}]`;
}

function IndicationLine(props: IndicationLineProps) {
  const { deltaInPixel, stackIndex, assignment, rangeId, axis, spectrumId } =
    props;
  const { margin, width, height } = useChartData();
  const { setData: addNewAssignmentLabel } = useShareData();
  const dispatch = useDispatch();

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const isOverXAxis = axis === 'x';
  const x = isOverXAxis ? deltaInPixel : margin.left;
  const y = isOverXAxis ? margin.top : deltaInPixel;

  const x2 = isOverXAxis ? 0 : innerWidth;
  const y2 = isOverXAxis ? innerHeight : 0;

  const labelX = isOverXAxis ? padding : padding + stackIndex * labelSize;
  const labelY = isOverXAxis ? padding + stackIndex * labelSize : -padding;

  const rectWidth = isOverXAxis ? rectSize : innerWidth;
  const rectHeight = isOverXAxis ? innerHeight : rectSize;
  const rectXOffset = isOverXAxis ? rectOffset : 0;
  const rectYOffset = isOverXAxis ? 0 : rectOffset;

  function removeAssignmentLabel() {
    dispatch({
      type: 'CHANGE_RANGE_ASSIGNMENT_LABEL',
      payload: {
        value: '',
        rangeId,
        spectrumId,
      },
    });
  }

  const actionsButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <PiTextTBold />,
      onClick: () => addNewAssignmentLabel(getAxisRangeId({ axis, rangeId })),
      intent: 'success',
      title: 'Add assignment label',
      visible: !assignment,
    },
    {
      icon: <PiTextTSlashBold />,
      onClick: removeAssignmentLabel,
      intent: 'danger',
      title: 'Remove assignment label',
      visible: !!assignment,
    },
  ];

  return (
    <ActionsButtonsPopover
      targetTagName="g"
      buttons={actionsButtons}
      space={2}
      position={isOverXAxis ? 'right-top' : 'top-left'}
    >
      <g transform={`translate(${x},${y})`}>
        <line stroke="lightgrey" x1={0} x2={x2} y1={0} y2={y2} />
        <Rect
          x={-rectXOffset}
          y={-rectYOffset}
          width={rectWidth}
          height={rectHeight}
          data-no-export="true"
        />
        <AssignmentLabel
          x={labelX}
          y={labelY}
          assignment={assignment}
          axis={axis}
          rangeId={rangeId}
          spectrumId={spectrumId}
        />
      </g>
    </ActionsButtonsPopover>
  );
}

interface AssignmentLabelProps {
  assignment?: string;
  axis: IndicationLinesAxis;
  x: number;
  y: number;
  rangeId: string;
  spectrumId: string;
}

function AssignmentLabel(props: AssignmentLabelProps) {
  const { axis, assignment, x, y, rangeId, spectrumId } = props;
  const { isNewAssignment, dismissNewLabel } = useTriggerNewAssignmentLabel(
    getAxisRangeId({ axis, rangeId }),
  );
  const dispatch = useDispatch();

  function handleChange(value: string) {
    dismissNewLabel();
    dispatch({
      type: 'CHANGE_RANGE_ASSIGNMENT_LABEL',
      payload: {
        value,
        rangeId,
        spectrumId,
      },
    });
  }

  if (!assignment && !isNewAssignment) return;

  return (
    <FieldEdition
      onChange={handleChange}
      inputType="text"
      value={assignment || ''}
      PopoverProps={{
        position: 'bottom',
        targetTagName: 'g',
        ...(isNewAssignment
          ? { isOpen: true, onClose: () => dismissNewLabel() }
          : {}),
      }}
    >
      <text
        x={x}
        y={y}
        fontSize={labelSize}
        fill="#555"
        dominantBaseline="hanging"
        textAnchor="start"
        transform={axis === 'x' ? undefined : `rotate(-90 ${x} ${y})`}
        style={{ cursor: 'hand' }}
      >
        {assignment}
      </text>
    </FieldEdition>
  );
}

export function SignalsGuideLines() {
  const spectrumData = useTracesSpectra();

  if (!spectrumData) return null;

  return (
    <ShareDataProvider>
      {spectrumData[0] && (
        <IndicationLines axis="x" spectrum={spectrumData[0]} />
      )}
      {spectrumData[0] && (
        <IndicationLines axis="y" spectrum={spectrumData[1]} />
      )}
    </ShareDataProvider>
  );
}
