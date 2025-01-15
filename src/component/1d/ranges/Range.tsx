import styled from '@emotion/styled';
import type { Range as RangeType } from 'nmr-processing';
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
  useAssignmentData,
} from '../../assignment/AssignmentsContext.js';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment.js';
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
import { IntegralIndicator } from '../integral/IntegralIndicator.js';
import { useScaleX } from '../utilities/scale.js';

import { AssignmentLabel } from './AssignmentLabel.js';
import { Atoms } from './Atoms.js';

const Group = styled.g<{ isActive: boolean }>`
  .target {
    visibility: ${({ isActive }) => (isActive ? 'visible' : 'hidden')};
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
    <Group
      data-testid="range"
      style={{ outline: 'none' }}
      key={id}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      isActive={assignmentRange.isActive}
    >
      <ActionsButtonsPopover
        targetTagName="g"
        {...(assignmentRange.isActive && { isOpen: true })}
        buttons={actionsButtons}
        space={2}
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
    </Group>
  );
}

export default Range;
