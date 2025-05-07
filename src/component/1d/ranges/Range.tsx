import type { Range as RangeType } from 'nmr-processing';
import { useRef } from 'react';
import { LuLink, LuUnlink } from 'react-icons/lu';
import { PiTextTBold, PiTextTSlashBold } from 'react-icons/pi';

import {
  isSpectrum1D,
  resizeRange,
} from '../../../data/data1d/Spectrum1D/index.js';
import { isRangeAssigned } from '../../../data/data1d/Spectrum1D/isRangeAssigned.js';
import { checkRangeKind } from '../../../data/utilities/RangeUtilities.js';
import {
  useAssignment,
  useAssignmentContext,
} from '../../assignment/AssignmentsContext.js';
import { filterAssignedIDs } from '../../assignment/utilities/filterAssignedIDs.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useLogger } from '../../context/LoggerContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import type { ActionsButtonsPopoverProps } from '../../elements/ActionsButtonsPopover.js';
import { ActionsButtonsPopover } from '../../elements/ActionsButtonsPopover.js';
import { useDialogData } from '../../elements/DialogManager.js';
import { ResizerWithScale } from '../../elements/ResizerWithScale.js';
import { HighlightEventSource, useHighlight } from '../../highlight/index.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import { useHighlightColor } from '../../hooks/useHighlightColor.js';
import { useResizerStatus } from '../../hooks/useResizerStatus.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { EditRangeModal } from '../../modal/editRange/EditRangeModal.js';
import { useIsInset } from '../inset/InsetProvider.js';
import { IntegralIndicator } from '../integral/IntegralIndicator.js';
import { useScaleX } from '../utilities/scale.js';

import { AssignmentLabel } from './AssignmentLabel.js';
import { Atoms } from './Atoms.js';

interface RangeProps {
  selectedTool: string;
  range: RangeType;
  assignmentLabelStackIndex: number;
  relativeFormat: string;
}

const minWidth = 10;

function Range(options: RangeProps) {
  const { range, selectedTool, relativeFormat, assignmentLabelStackIndex } =
    options;
  const {
    id,
    integration,
    signals,
    from,
    to,
    diaIDs: rangeDiaIDs,
    assignment,
  } = range;
  const isInset = useIsInset();
  const spectrum = useSpectrum();
  const isAssignBtnTrigged = useRef(false);
  const { margin } = useChartData();

  const highlightColor = useHighlightColor();
  const assignmentData = useAssignmentContext();
  const assignmentRange = useAssignment(id);
  const highlightRange = useHighlight(
    [id].concat(assignmentRange.assignedDiaIds?.x || []).concat(
      filterAssignedIDs(
        assignmentData.data,
        signals.map((_signal) => _signal.id),
      ),
    ),
    {
      type: HighlightEventSource.RANGE,
      extra: { id, spectrumID: spectrum.id },
    },
  );

  const scaleX = useScaleX();
  const dispatch = useDispatch();
  const { logger } = useLogger();
  const { showIntegralsValues } = useActiveSpectrumRangesViewState();

  const { isDialogOpen } = useDialogData();

  const isBlockedByEditing = selectedTool && isDialogOpen(EditRangeModal);

  function handleOnStopResizing(position) {
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
    assignmentRange.highlight('x');
    highlightRange.show();
  }

  function mouseLeaveHandler() {
    assignmentRange.clearHighlight();
    highlightRange.hide();
  }

  function assignHandler() {
    if (!isBlockedByEditing) {
      isAssignBtnTrigged.current = true;
      assignmentRange.activate('x');
    }
  }

  function unAssignHandler(signalIndex = -1) {
    dispatch({
      type: 'UNLINK_RANGE',
      payload: {
        rangeKey: range.id,
        signalIndex,
      },
    });
  }
  const isAssignmentActive = assignmentRange.isActive;
  const isNotSignal = !checkRangeKind(range);
  const isHighlighted =
    isBlockedByEditing || highlightRange.isActive || isAssignmentActive;

  const isAssigned = isRangeAssigned(range);
  const isResizingActive = useResizerStatus('rangePicking');
  const { setData: addNewAssignmentLabel } = useShareData();

  function removeAssignmentLabel() {
    dispatch({
      type: 'CHANGE_RANGE_ASSIGNMENT_LABEL',
      payload: {
        value: '',
        rangeID: id,
      },
    });
  }

  const actionsButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <LuLink />,
      onClick: assignHandler,
      intent: 'success',
      title: 'Assign range',
    },
    {
      icon: <LuUnlink />,
      onClick: () => unAssignHandler(),
      intent: 'danger',
      title: 'Unassign range',
      visible: !!(isAssignmentActive || rangeDiaIDs),
    },
    {
      icon: <PiTextTBold />,
      onClick: () => addNewAssignmentLabel(range.id),
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

                <AssignmentLabel
                  stackIndex={assignmentLabelStackIndex}
                  range={range}
                  width={rangeWidth}
                />
                <Atoms range={range} x={rangeWidth / 2} />

                {showIntegralsValues && (
                  <IntegralIndicator
                    value={integration}
                    format={relativeFormat}
                    width={rangeWidth}
                    opacity={isNotSignal ? 0.5 : 1}
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
