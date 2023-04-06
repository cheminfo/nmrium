/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Signal1D } from '../../../data/types/data1d';
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
import MultiplicityTree from '../multiplicityTree/MultiplicityTree';

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

export interface RangeData {
  id: string;
  from: number;
  to: number;
  integration: number;
  signals: Signal1D[];
  diaIDs?: string[];
}

interface RangeProps {
  showMultiplicityTrees: boolean;
  selectedTool: string;
  rangeData: RangeData;
  relativeFormat: string;
}

function Range({
  rangeData,
  showMultiplicityTrees,
  selectedTool,
  relativeFormat,
}: RangeProps) {
  const { viewerRef } = useGlobal();
  const { id, integration, signals, diaIDs } = rangeData;
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
        ...rangeData,
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

  function assignHandler() {
    if (!isBlockedByEditing) {
      if (!diaIDs) {
        assignmentRange.setActive('x');
      } else {
        dispatch({
          type: UNLINK_RANGE,
          payload: {
            rangeData,
            assignmentData,
            signalIndex: -1,
          },
        });
      }
    }
  }
  const from = scaleX()(rangeData.from);
  const to = scaleX()(rangeData.to);

  const isNotSignal = !checkRangeKind(rangeData);
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

      {showMultiplicityTrees &&
        signals &&
        signals.length > 0 &&
        signals.map((_signal) => (
          <MultiplicityTree
            rangeFrom={rangeData.from}
            rangeTo={rangeData.to}
            signal={_signal}
            key={_signal.id}
          />
        ))}
      <LinkButton
        isActive={!!(assignmentRange.isActive || diaIDs)}
        x={from - 16}
        onLink={assignHandler}
      />
    </g>
  );
}

export default Range;
