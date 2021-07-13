/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useState, useEffect } from 'react';

import { checkRangeKind } from '../../../data/utilities/RangeUtilities';
import {
  filterForIDsWithAssignment,
  useAssignment,
  useAssignmentData,
} from '../../assignment';
import { useDispatch } from '../../context/DispatchContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { TYPES, useHighlight } from '../../highlight';
import { RESIZE_RANGE } from '../../reducer/types/Types';
import { options } from '../../toolbar/ToolTypes';
import Resizable from '../Resizable';
import MultiplicityTree, {
  SignalNodeProps,
} from '../multiplicityTree/MultiplicityTree';
import TempMultiplicityTree from '../multiplicityTree/TempMultiplicityTree';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  .delete-button {
    visibility: hidden;
  }
`;

const stylesHighlighted = css`
  pointer-events: bounding-box;

  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  .range-area {
    height: 100%;
    fill: #ff6f0057;
  }
  .delete-button {
    visibility: visible;
    cursor: pointer;
  }
`;

export interface RangeData {
  id: string;
  from: number;
  to: number;
  integral: number;
  signal: Array<SignalNodeProps>;
}

interface RangeProps {
  showMultiplicityTrees: boolean;
  selectedTool: string;
  rangeData: RangeData;
  startEditMode: boolean;
}

function Range({
  rangeData,
  showMultiplicityTrees,
  selectedTool,
  startEditMode,
}: RangeProps) {
  const { id, from: rangeFrom, to: rangeTo, integral, signal } = rangeData;
  const assignmentData = useAssignmentData();
  const assignmentRange = useAssignment(id);
  const highlightRange = useHighlight(
    [assignmentRange.id].concat(assignmentRange.assigned.x || []).concat(
      filterForIDsWithAssignment(
        assignmentData,
        signal.map((_signal) => _signal.id),
      ),
    ),
    TYPES.RANGE,
  );
  const [rangeBoundary, setRangeBoundary] = useState({
    from: rangeFrom,
    to: rangeTo,
  });

  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();

  const [reduceOpacity, setReduceOpacity] = useState(false);
  const [isBlockedByEditing, setIsBlockedByEditing] = useState(false);

  useEffect(() => {
    setRangeBoundary({
      from: rangeFrom,
      to: rangeTo,
    });
  }, [rangeFrom, rangeTo]);

  useEffect(() => {
    if (selectedTool && selectedTool === options.editRange.id) {
      setIsBlockedByEditing(true);
    } else {
      setIsBlockedByEditing(false);
    }
  }, [selectedTool]);

  useEffect(() => {
    setReduceOpacity(!checkRangeKind(rangeData));
  }, [rangeData]);

  const handleOnStopResizing = useCallback(
    (resized) => {
      dispatch({
        type: RESIZE_RANGE,
        data: { ...rangeData, ...resized },
      });
    },
    [dispatch, rangeData],
  );

  const mouseEnterHandler = useCallback(() => {
    assignmentRange.onMouseEnter('x');
    highlightRange.show();
  }, [assignmentRange, highlightRange]);

  const mouseLeaveHandler = useCallback(() => {
    assignmentRange.onMouseLeave('x');
    highlightRange.hide();
  }, [assignmentRange, highlightRange]);

  const assignHandler = useCallback(
    (e) => {
      if (
        selectedTool === options.rangesPicking.id &&
        e.shiftKey &&
        !isBlockedByEditing
      ) {
        assignmentRange.onClick('x');
      }
    },
    [assignmentRange, isBlockedByEditing, selectedTool],
  );

  const dragHandler = useCallback((boundary) => {
    setRangeBoundary((range) => ({ ...range, ...boundary }));
  }, []);

  const { from, to } = rangeBoundary;

  return (
    <g
      data-test-id="range"
      style={{ outline: 'none' }}
      css={
        isBlockedByEditing ||
        highlightRange.isActive ||
        assignmentRange.isActive
          ? stylesHighlighted
          : stylesOnHover
      }
      key={id}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      onClick={assignHandler}
    >
      <g transform={`translate(${scaleX()(to)},10)`}>
        <rect
          x="0"
          width={Math.abs(scaleX()(from) - scaleX()(to))}
          height="6"
          className="range-area"
          fill="green"
          fillOpacity={
            !reduceOpacity ||
            highlightRange.isActive ||
            assignmentRange.isActive
              ? 1
              : 0.4
          }
        />
        <text
          textAnchor="middle"
          x={Math.abs(scaleX()(from) - scaleX()(to)) / 2}
          y="20"
          fontSize="10"
          fill="red"
          fillOpacity={
            !reduceOpacity ||
            highlightRange.isActive ||
            assignmentRange.isActive
              ? 1
              : 0.6
          }
        >
          {integral !== undefined ? integral.toFixed(2) : ''}
        </text>
      </g>
      <Resizable
        from={rangeData.from}
        to={rangeData.to}
        onDrop={handleOnStopResizing}
        onDrag={dragHandler}
      />
      {startEditMode ? (
        <TempMultiplicityTree />
      ) : (
        showMultiplicityTrees &&
        signal &&
        signal.length > 0 &&
        signal.map((_signal) => (
          <MultiplicityTree
            rangeFrom={from}
            rangeTo={to}
            signal={_signal}
            key={_signal.id}
          />
        ))
      )}
    </g>
  );
}

export default Range;
