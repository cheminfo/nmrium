/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Range as RangeType } from 'nmr-processing';

import { isRangeAssigned } from '../../../data/data1d/Spectrum1D/isRangeAssigned';
import { checkRangeKind } from '../../../data/utilities/RangeUtilities';
import {
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment';
import { useDispatch } from '../../context/DispatchContext';
import { ResizerWithScale } from '../../elements/ResizerWithScale';
import { HighlightEventSource, useHighlight } from '../../highlight';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import { useResizerStatus } from '../../hooks/useResizerStatus';
import { options } from '../../toolbar/ToolTypes';
import { IntegralIndicator } from '../integral/IntegralIndicator';
import { MultiplicityTree } from '../multiplicityTree/MultiplicityTree';
import { useScaleX } from '../utilities/scale';

import { AssignmentActionsButtons } from './AssignmentActionsButtons';

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

function Range({
  range,
  showMultiplicityTrees,
  selectedTool,
  relativeFormat,
}: RangeProps) {
  const { id, integration, signals, diaIDs, from, to } = range;
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
  const { showIntegralsValues } = useActiveSpectrumRangesViewState();

  const isBlockedByEditing =
    selectedTool && selectedTool === options.editRange.id;

  function handleOnStopResizing(position) {
    dispatch({
      type: 'RESIZE_RANGE',
      payload: {
        range: {
          ...range,
          from: scaleX().invert(position.x2),
          to: scaleX().invert(position.x1),
        },
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
  function assignHandler() {
    if (!isBlockedByEditing) {
      assignmentRange.setActive('x');
    }
  }

  const isNotSignal = !checkRangeKind(range);
  const isHighlighted =
    isBlockedByEditing || highlightRange.isActive || assignmentRange.isActive;

  const isAssigned = isRangeAssigned(range);
  const isResizingActive = useResizerStatus('rangePicking');

  return (
    <g
      data-testid="range"
      style={{ outline: 'none' }}
      key={id}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      {...(!assignmentRange.isActive && { css: style })}
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
                  fill="#ffd700"
                  opacity="0.35"
                  data-no-export="true"
                />
              )}
              <rect
                width={width}
                height="100%"
                fill={isHighlighted || isActive ? '#ff6f0057' : 'transparent'}
                data-no-export="true"
              />

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

      {showMultiplicityTrees && (
        <MultiplicityTree range={range} onUnlink={unAssignHandler} />
      )}
      <AssignmentActionsButtons
        isActive={!!(assignmentRange.isActive || diaIDs)}
        x={scaleX()(from) - 16}
        onAssign={assignHandler}
        onUnAssign={() => unAssignHandler()}
      />
    </g>
  );
}

export default Range;
