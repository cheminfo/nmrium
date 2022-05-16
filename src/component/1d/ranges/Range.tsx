/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useState, useEffect } from 'react';

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
import { HighlightedSource, useHighlight } from '../../highlight';
import { RESIZE_RANGE } from '../../reducer/types/Types';
import { options } from '../../toolbar/ToolTypes';
import { formatNumber } from '../../utility/formatNumber';
import MultiplicityTree from '../multiplicityTree/MultiplicityTree';
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
  integration: number;
  signals: Signal1D[];
}

interface RangeProps {
  showMultiplicityTrees: boolean;
  selectedTool: string;
  rangeData: RangeData;
  startEditMode: boolean;
  relativeFormat: string;
}

function Range({
  rangeData,
  showMultiplicityTrees,
  selectedTool,
  startEditMode,
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
    { type: HighlightedSource.RANGE, extra: { id } },
  );

  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();

  const [reduceOpacity, setReduceOpacity] = useState(false);
  const [isBlockedByEditing, setIsBlockedByEditing] = useState(false);

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
    (position) => {
      dispatch({
        type: RESIZE_RANGE,
        data: {
          ...rangeData,
          from: scaleX().invert(position.x2),
          to: scaleX().invert(position.x1),
        },
      });
    },
    [dispatch, rangeData, scaleX],
  );

  const mouseEnterHandler = useCallback(() => {
    assignmentRange.show('x');
    highlightRange.show();
  }, [assignmentRange, highlightRange]);

  const mouseLeaveHandler = useCallback(() => {
    assignmentRange.hide();
    highlightRange.hide();
  }, [assignmentRange, highlightRange]);

  const assignHandler = useCallback(
    (e) => {
      if (
        selectedTool === options.rangesPicking.id &&
        e.shiftKey &&
        !isBlockedByEditing
      ) {
        assignmentRange.setActive('x');
      }
    },
    [assignmentRange, isBlockedByEditing, selectedTool],
  );
  const from = scaleX()(rangeData.from);
  const to = scaleX()(rangeData.to);
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
      >
        {({ x1, x2 }, isActive) => (
          <g
            transform={`translate(0,10)`}
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
              data-no-export="true"
              x="0"
              width={x2 - x1}
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
              x={(x2 - x1) / 2}
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
              {integration !== undefined
                ? formatNumber(integration, relativeFormat)
                : ''}
            </text>
          </g>
        )}
      </Resizer>

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

export default Range;
