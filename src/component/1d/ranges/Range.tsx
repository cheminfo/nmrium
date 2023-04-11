/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Range as RangeType } from '../../../data/types/data1d';
import { checkRangeKind } from '../../../data/utilities/RangeUtilities';
import {
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment';
import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
import { useScaleChecked } from '../../context/ScaleContext';
import Resizer from '../../elements/resizer/Resizer';
import { HighlightEventSource, useHighlight } from '../../highlight';
import { RESIZE_RANGE, UNLINK_RANGE } from '../../reducer/types/Types';
import { options } from '../../toolbar/ToolTypes';
import { IntegralIndicator } from '../integral/IntegralIndicator';
import { MultiplicityTree } from '../multiplicityTree/MultiplicityTree';

import { LinkButton } from './LinkButton';

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
  const { viewerRef } = useGlobal();
  const { id, integration, signals, diaIDs } = range;
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

  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();

  const isBlockedByEditing =
    selectedTool && selectedTool === options.editRange.id;

  function handleOnStopResizing(position) {
    dispatch({
      type: RESIZE_RANGE,
      data: {
        ...range,
        from: scaleX().invert(position.x2),
        to: scaleX().invert(position.x1),
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

  function unAssignHandler(signalIndex: number) {
    dispatch({
      type: UNLINK_RANGE,
      payload: {
        rangeData: range,
        assignmentData,
        signalIndex,
      },
    });
  }
  function assignHandler() {
    if (!isBlockedByEditing) {
      if (!diaIDs) {
        assignmentRange.setActive('x');
      } else {
        unAssignHandler(-1);
      }
    }
  }
  const from = scaleX()(range.from);
  const to = scaleX()(range.to);

  const isNotSignal = !checkRangeKind(range);
  const isHighlighted =
    isBlockedByEditing || highlightRange.isActive || assignmentRange.isActive;

  return (
    <g
      data-test-id="range"
      style={{ outline: 'none' }}
      key={id}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      {...(!assignmentRange.isActive && { css: style })}
    >
      <Resizer
        tag="svg"
        initialPosition={{ x1: to, x2: from }}
        onEnd={handleOnStopResizing}
        parentElement={viewerRef}
        key={`${id}_${to}_${from}`}
        disabled={selectedTool !== options.rangePicking.id}
      >
        {({ x1, x2 }, isActive) => {
          const width = x2 - x1;
          return (
            <g>
              <rect
                width={width}
                height="100%"
                fill={isHighlighted || isActive ? '#ff6f0057' : 'transparent'}
                data-no-export="true"
              />

              <IntegralIndicator
                value={integration}
                format={relativeFormat}
                width={width}
                opacity={isNotSignal ? 0.5 : 1}
              />
            </g>
          );
        }}
      </Resizer>

      {showMultiplicityTrees && (
        <MultiplicityTree range={range} onUnlink={unAssignHandler} />
      )}
      <LinkButton
        isActive={!!(assignmentRange.isActive || diaIDs)}
        x={from - 16}
        onClick={() => assignHandler()}
      />
    </g>
  );
}

export default Range;
