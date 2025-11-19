import type { Range as RangeType } from '@zakodium/nmr-types';
import { useRef } from 'react';

import {
  isSpectrum1D,
  resizeRange,
} from '../../../data/data1d/Spectrum1D/index.js';
import { isRangeAssigned } from '../../../data/data1d/Spectrum1D/isRangeAssigned.js';
import { getOpacityBasedOnSignalKind } from '../../../data/utilities/RangeUtilities.js';
import {
  useAssignment,
  useAssignmentContext,
} from '../../assignment/AssignmentsContext.js';
import { filterAssignedIDs } from '../../assignment/utilities/filterAssignedIDs.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useLogger } from '../../context/LoggerContext.js';
import { ActionsButtonsPopover } from '../../elements/ActionsButtonsPopover.js';
import { useDialogData } from '../../elements/DialogManager.js';
import { ResizerWithScale } from '../../elements/ResizerWithScale.js';
import { useHighlight } from '../../highlight/index.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import { useHighlightColor } from '../../hooks/useHighlightColor.js';
import { useResizerStatus } from '../../hooks/useResizerStatus.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { EditRangeModal } from '../../modal/editRange/EditRangeModal.js';
import type { StackOverlappingLabelsMapReturnType } from '../../utility/stackOverlappingLabels.ts';
import { useIsInset } from '../inset/InsetProvider.js';
import { IntegralIndicator } from '../integral/IntegralIndicator.js';
import { useScaleX } from '../utilities/scale.js';

import { AssignmentLabel } from './AssignmentLabel.tsx';
import { Atoms } from './Atoms.js';
import { useAssignmentsPopoverActionsButtons } from './useAssignmentsPopoverActionsButtons.tsx';


interface RangeProps {
  selectedTool: string;
  range: RangeType;
  relativeFormat: string;
  signalsStackIndexes: StackOverlappingLabelsMapReturnType
}

const minWidth = 10;

function Range(options: RangeProps) {
  const { range, selectedTool, relativeFormat, signalsStackIndexes } =
    options;
  const {
    id,
    integration,
    signals,
    from,
    to
  } = range;
  const isInset = useIsInset();
  const spectrum = useSpectrum();
  const isAssignBtnTrigged = useRef(false);
  const { margin } = useChartData();
  const signal = signals?.[0];

  const highlightColor = useHighlightColor();
  const assignmentData = useAssignmentContext();
  const signalAssignment = useAssignment(signal.id);
  const highlightRange = useHighlight(
    [id].concat(signalAssignment.assignedDiaIds?.x || []).concat(
      filterAssignedIDs(
        assignmentData.data,
        signals.map((_signal) => _signal.id),
      ),
    ),
    {
      type: 'RANGE',
      extra: { id, spectrumID: spectrum.id },
    },
  );

  const scaleX = useScaleX();
  const dispatch = useDispatch();
  const { logger } = useLogger();
  const { showIntegralsValues } = useActiveSpectrumRangesViewState();

  const { isDialogOpen } = useDialogData();

  const isBlockedByEditing = selectedTool && isDialogOpen(EditRangeModal);

  function handleOnStopResizing(position: any) {
    if (!spectrum || !isSpectrum1D(spectrum)) return;
    const from = scaleX().invert(position.x2);
    const to = scaleX().invert(position.x1);

    const newRange = resizeRange(spectrum, { from, to, range, logger });

    if (!newRange) return;

    dispatch({
      type: 'RESIZE_RANGE',
      payload: {
        range: newRange,
        spectrumKey: spectrum.id,
      },
    });
  }

  function mouseEnterHandler() {
    signalAssignment.highlight('x');
    highlightRange.show();
  }

  function mouseLeaveHandler() {
    signalAssignment.clearHighlight();
    highlightRange.hide();
  }

  function assignHandler() {
    if (!isBlockedByEditing) {
      isAssignBtnTrigged.current = true;
      signalAssignment.activate('x');
    }
  }

  function unAssignHandler() {
    dispatch({
      type: 'UNASSIGN_1D_SIGNAL',
      payload: {
        rangeKey: range.id,
        signalIndex: 0,
      },
    });
  }
  const isAssignmentActive = signalAssignment.isActive;
  const opacity = getOpacityBasedOnSignalKind(range);

  const isHighlighted =
    isBlockedByEditing || highlightRange.isActive || isAssignmentActive;

  const isSignalAssigned = isRangeAssigned(range);
  const isResizingActive = useResizerStatus('rangePicking');
  const hasOnlyOneSignal = signals.length === 1;
  const isAssigned = hasOnlyOneSignal && signal.diaIDs ? signal.diaIDs.length > 0 : false


  const actionsButtons = useAssignmentsPopoverActionsButtons({
    isToggleMultiplicityTreeButtonVisible: !hasOnlyOneSignal,
    isAssignButtonVisible: hasOnlyOneSignal,
    isUnAssignButtonVisible: isAssignmentActive || isSignalAssigned,
    isAssignLabelButtonVisible: hasOnlyOneSignal && !signal.assignment,
    isUnAssignLabelButtonVisible: hasOnlyOneSignal && !!signal.assignment,
    onAssign: assignHandler,
    onUnAssign: unAssignHandler,
    rangeId: range.id
  })


  const isOpen = isAssignBtnTrigged.current ? isAssignmentActive : undefined;

  return (
    <ActionsButtonsPopover
      targetTagName="g"
      isOpen={isOpen}
      buttons={actionsButtons}
      space={2}
      disabled={isInset}
      onClosed={() => {
        isAssignBtnTrigged.current = false;
      }}
      offsetYMode="cursor"
    >
      <g
        data-testid="range"
        style={{ outline: 'none' }}
        key={id}
        onMouseEnter={mouseEnterHandler}
        onMouseLeave={mouseLeaveHandler}
      >
        <ResizerWithScale
          from={from}
          to={to}
          onEnd={handleOnStopResizing}
          disabled={!isResizingActive}
        >
          {({ x1, x2 }, isActive) => {
            const rangeWidth = x2 - x1;
            let offsetX = 0;
            let highlightRectWidth = rangeWidth;

            if (rangeWidth < minWidth) {
              offsetX = Math.abs(rangeWidth - minWidth) / 2;
              highlightRectWidth = minWidth;
            }

            return (
              <g>
                {isAssigned && !isHighlighted && !isActive && (
                  <rect
                    y={margin.top}
                    width={rangeWidth}
                    height="10px"
                    fill={highlightColor}
                    data-no-export="true"
                  />
                )}

                <rect
                  x={-offsetX}
                  width={highlightRectWidth}
                  height="100%"
                  fill={isHighlighted || isActive ? '#ff6f0057' : 'transparent'}
                  data-no-export="true"
                />
                {range.signals.map((signal) => (
                  <AssignmentLabel
                    key={signal.id}
                    stackIndex={signalsStackIndexes?.[signal.id] || 0}
                    range={range}
                    width={rangeWidth} signal={signal} />

                ))}


                <Atoms range={range} x={rangeWidth / 2} />

                {showIntegralsValues && (
                  <IntegralIndicator
                    value={integration}
                    format={relativeFormat}
                    width={rangeWidth}
                    opacity={opacity}
                  />
                )}
              </g>
            );
          }}
        </ResizerWithScale>
      </g>
    </ActionsButtonsPopover>
  );
}

export default Range;
