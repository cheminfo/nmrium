/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Range as RangeType } from 'nmr-processing';
import { LuUnlink, LuLink } from 'react-icons/lu';
import { PiTextTBold, PiTextTSlashBold } from 'react-icons/pi';

import { isSpectrum1D, resizeRange } from '../../../data/data1d/Spectrum1D';
import { isRangeAssigned } from '../../../data/data1d/Spectrum1D/isRangeAssigned';
import { checkRangeKind } from '../../../data/utilities/RangeUtilities';
import {
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment';
import { useDispatch } from '../../context/DispatchContext';
import { useLogger } from '../../context/LoggerContext';
import { useShareData } from '../../context/ShareDataContext';
import {
  ActionsButtonsPopover,
  ActionsButtonsPopoverProps,
} from '../../elements/ActionsButtonsPopover';
import { useDialogData } from '../../elements/DialogManager';
import { ResizerWithScale } from '../../elements/ResizerWithScale';
import { HighlightEventSource, useHighlight } from '../../highlight';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import { useHighlightColor } from '../../hooks/useHighlightColor';
import { useResizerStatus } from '../../hooks/useResizerStatus';
import useSpectrum from '../../hooks/useSpectrum';
import { EditRangeModal } from '../../modal/editRange/EditRangeModal';
import { IntegralIndicator } from '../integral/IntegralIndicator';
import { useScaleX } from '../utilities/scale';

import { AssignmentLabel } from './AssignmentLabel';
import { Atoms } from './Atoms';

const style = css`
  .target {
    visibility: hidden;
  }

  &:hover {
    .target {
      visibility: visible;
    }
  }
`;

interface RangeProps {
  showMultiplicityTrees: boolean;
  selectedTool: string;
  range: RangeType;
  relativeFormat: string;
}

function Range({ range, selectedTool, relativeFormat }: RangeProps) {
  const {
    id,
    integration,
    signals,
    from,
    to,
    diaIDs: rangeDiaIDs,
    assignment,
  } = range;
  const highlightColor = useHighlightColor();
  const assignmentData = useAssignmentData();
  const assignmentRange = useAssignment(id);
  const highlightRange = useHighlight(
    [assignmentRange.id].concat(assignmentRange.assigned?.x || []).concat(
      filterForIDsWithAssignment(
        assignmentData,
        signals.map((_signal) => _signal.id),
      ),
    ),
    { type: HighlightEventSource.RANGE, extra: { id } },
  );

  const scaleX = useScaleX();
  const dispatch = useDispatch();
  const { logger } = useLogger();
  const spectrum = useSpectrum();
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
      },
    });
  }

  function mouseEnterHandler() {
    assignmentRange.show('x');
    highlightRange.show();
  }

  function mouseLeaveHandler() {
    assignmentRange.hide();
    highlightRange.hide();
  }

  function assignHandler() {
    if (!isBlockedByEditing) {
      assignmentRange.setActive('x');
    }
  }

  function unAssignHandler(signalIndex = -1) {
    dispatch({
      type: 'UNLINK_RANGE',
      payload: {
        range,
        assignmentData,
        signalIndex,
      },
    });
  }

  const isNotSignal = !checkRangeKind(range);
  const isHighlighted =
    isBlockedByEditing || highlightRange.isActive || assignmentRange.isActive;

  const isAssigned = isRangeAssigned(range);
  const isResizingActive = useResizerStatus('rangePicking');
  const { setData: addNewAssignmentLabel } = useShareData();

  const isAssignmentActive = !!(assignmentRange.isActive || rangeDiaIDs);

  function removeAssignemntlabel() {
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
      visible: isAssignmentActive,
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
      onClick: removeAssignemntlabel,
      intent: 'danger',
      title: 'Remove assignment label',
      visible: !!assignment,
    },
  ];
  return (
    <g
      data-testid="range"
      style={{ outline: 'none' }}
      key={id}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      {...(!assignmentRange.isActive && { css: style })}
    >
      <ActionsButtonsPopover
        targetTagName="g"
        {...(assignmentRange.isActive && { isOpen: true })}
        buttons={actionsButtons}
      >
        <ResizerWithScale
          from={from}
          to={to}
          onEnd={handleOnStopResizing}
          disabled={!isResizingActive}
        >
          {({ x1, x2 }, isActive) => {
            const width = x2 - x1;
            return (
              <g>
                {isAssigned && !isHighlighted && !isActive && (
                  <rect
                    width={width}
                    height="10px"
                    fill={highlightColor}
                    data-no-export="true"
                  />
                )}

                <rect
                  width={width}
                  height="100%"
                  fill={isHighlighted || isActive ? '#ff6f0057' : 'transparent'}
                  data-no-export="true"
                />

                <AssignmentLabel range={range} width={width} />
                <Atoms range={range} x={width / 2} />

                {showIntegralsValues && (
                  <IntegralIndicator
                    value={integration}
                    format={relativeFormat}
                    width={width}
                    opacity={isNotSignal ? 0.5 : 1}
                  />
                )}
              </g>
            );
          }}
        </ResizerWithScale>
      </ActionsButtonsPopover>
    </g>
  );
}

export default Range;
