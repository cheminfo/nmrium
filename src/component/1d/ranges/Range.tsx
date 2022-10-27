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
import { RESIZE_RANGE } from '../../reducer/types/Types';
import { options } from '../../toolbar/ToolTypes';
import { IntegralIndicator } from '../integral/IntegralIndicator';
import MultiplicityTree from '../multiplicityTree/MultiplicityTree';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  .highlight {
    fill: transparent;
  }
  .target {
    visibility: hidden;
  }
`;

const stylesHighlighted = css`
  pointer-events: bounding-box;

  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  fill: #ff6f0057;

  .target {
    visibility: visible;
  }
`;

export interface RangeData {
  id: string;
  from: number;
  to: number;
  integration: number;
  signals: Signal1D[];
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
  const { id, integration, signals } = rangeData;
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

  function assignHandler(e) {
    if (
      selectedTool === options.rangePicking.id &&
      e.shiftKey &&
      !isBlockedByEditing
    ) {
      assignmentRange.setActive('x');
    }
  }
  const from = scaleX()(rangeData.from);
  const to = scaleX()(rangeData.to);

  const isNotSignal = !checkRangeKind(rangeData);

  return (
    <g
      data-test-id="range"
      style={{ outline: 'none' }}
      key={id}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      onClick={assignHandler}
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
            <g
              css={
                isBlockedByEditing ||
                highlightRange.isActive ||
                assignmentRange.isActive ||
                isActive
                  ? stylesHighlighted
                  : stylesOnHover
              }
            >
              <rect
                width={width}
                height="100%"
                className="highlight"
                data-no-export="true"
              />
              <IntegralIndicator
                value={integration}
                format={relativeFormat}
                width={width}
                lineColor={isNotSignal ? 'red' : 'black'}
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
    </g>
  );
}

export default Range;
