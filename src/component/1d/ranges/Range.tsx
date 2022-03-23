/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useState, useEffect, memo, useMemo } from 'react';

import { Range as RangType } from '../../../data/types/data1d';
import { checkRangeKind } from '../../../data/utilities/RangeUtilities';
import {
  filterForIDsWithAssignment,
  useAssignment,
  useAssignmentData,
} from '../../assignment';
import { useDispatch } from '../../context/DispatchContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { HighlightedSource, useHighlight } from '../../highlight';
import { RESIZE_RANGE } from '../../reducer/types/Types';
import { options } from '../../toolbar/ToolTypes';
import Resizable from '../Resizable';
import MultiplicityTree from '../multiplicityTree/MultiplicityTree';
import TempMultiplicityTree from '../multiplicityTree/TempMultiplicityTree';
// import { useWhatChanged } from '@simbathesailor/use-what-changed';

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

interface RangeProps {
  showMultiplicityTrees: boolean;
  selectedTool: string;
  rangeData: RangType;
  startEditMode: boolean;
}

function Range({
  rangeData,
  showMultiplicityTrees,
  selectedTool,
  startEditMode,
}: RangeProps) {
  const { id, from: rangeFrom, to: rangeTo, integration, signals } = rangeData;

  const assignmentData = useAssignmentData();
  const {
    id: assignmentRangeID,
    assigned,
    onMouseEnter,
    onMouseLeave,
    onClick,
    isActive: isAssignmentActive,
  } = useAssignment(id);
  const highlightId = useMemo(
    () =>
      [assignmentRangeID].concat(assigned.x || []).concat(
        filterForIDsWithAssignment(
          assignmentData,
          signals.map((_signal) => _signal.id),
        ),
      ),
    [assignmentRangeID, assigned.x, assignmentData, signals],
  );
  const { show, hide, isActive } = useHighlight(
    highlightId,
    useMemo(() => ({ type: HighlightedSource.RANGE, extra: { id } }), [id]),
  );
  // useWhatChanged(
  //   [
  //     show,
  //     hide,
  //     isActive,
  //     highlightId,
  //     assignmentRangeID,
  //     assigned,
  //     assignmentData,
  //   ],
  //   'show, hide, isActive,highlightId,assignmentRange,assignmentData',
  // );
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
    if (!isBlockedByEditing) {
      onMouseEnter('x');
      show();
    }
  }, [isBlockedByEditing, onMouseEnter, show]);

  const mouseLeaveHandler = useCallback(() => {
    if (!isBlockedByEditing) {
      onMouseLeave('x');
      hide();
    }
  }, [hide, isBlockedByEditing, onMouseLeave]);

  const assignHandler = useCallback(
    (e) => {
      if (
        selectedTool === options.rangesPicking.id &&
        e.shiftKey &&
        !isBlockedByEditing
      ) {
        onClick('x');
      }
    },
    [isBlockedByEditing, onClick, selectedTool],
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
        isBlockedByEditing || isActive || isAssignmentActive
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
            !reduceOpacity || isActive || isAssignmentActive ? 1 : 0.4
          }
        />
        <text
          textAnchor="middle"
          x={Math.abs(scaleX()(from) - scaleX()(to)) / 2}
          y="20"
          fontSize="10"
          fill="red"
          fillOpacity={
            !reduceOpacity || isActive || isAssignmentActive ? 1 : 0.6
          }
        >
          {integration !== undefined ? integration.toFixed(2) : ''}
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
        signals &&
        signals.length > 0 &&
        signals.map((_signal) => (
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

export default memo(Range);
