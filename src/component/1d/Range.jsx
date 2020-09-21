import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useCallback, useState, useEffect } from 'react';

import { useAssignment, useAssignmentData } from '../assignment';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useScale } from '../context/ScaleContext';
import { useHighlight } from '../highlight';
import { SignalKindsToConsiderInIntegralsSum } from '../panels/extra/constants/SignalsKinds';
import { buildID } from '../panels/extra/utilities/Concatenation';
import {
  checkSignalKinds,
  deleteRange,
} from '../panels/extra/utilities/RangeUtilities';
import { RESIZE_RANGE } from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';

import MultiplicityTree from './MultiplicityTree';
import Resizable from './Resizable';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  // // disabled because Resizable component appears now when hovering over it
  // :hover .range-area {
  //   height: 100%;
  //   fill: #ff6f0057;
  //   cursor: pointer;
  // }

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

const Range = ({ rangeData }) => {
  const { id, from, to, integral, signal } = rangeData;
  const assignmentRange = useAssignment(id);
  const highlightRange = useHighlight(
    [assignmentRange.id].concat(assignmentRange.assigned.x || []),
  );
  const assignmentData = useAssignmentData();

  const { scaleX } = useScale();
  const { selectedTool } = useChartData();
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
    setReduceOpacity(
      !checkSignalKinds(rangeData, SignalKindsToConsiderInIntegralsSum),
    );
  }, [rangeData]);

  const deleteHandler = useCallback(() => {
    deleteRange(assignmentData, dispatch, rangeData);
  }, [assignmentData, dispatch, rangeData]);

  // const handleOnStartResizing = useCallback(() => {}, []);

  const handleOnStopResizing = useCallback(
    (resized) => {
      dispatch({
        type: RESIZE_RANGE,
        data: { ...rangeData, ...resized },
      });
    },
    [dispatch, rangeData],
  );

  const DeleteButton = () => {
    return (
      <svg
        className="delete-button"
        // transform={`translate(${scaleX()(to) - 20},10)`}
        x={scaleX()(to) - 20}
        y={10}
        onClick={() => deleteHandler()}
        data-no-export="true"
        width="16"
        height="16"
      >
        <rect rx="5" width="16" height="16" fill="#c81121" />
        <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <g
      css={
        isBlockedByEditing ||
        highlightRange.isActive ||
        assignmentRange.isActive
          ? stylesHighlighted
          : stylesOnHover
      }
      key={id}
      {...{
        onMouseEnter: () => {
          assignmentRange.onMouseEnter('x');
          highlightRange.show();
        },
        onMouseLeave: () => {
          assignmentRange.onMouseLeave('x');
          highlightRange.hide();
        },
      }}
      {...{
        onClick: !isBlockedByEditing
          ? (e) => {
              if (e.shiftKey) {
                assignmentRange.onClick(e, 'x');
              }
            }
          : null,
      }}
    >
      <g transform={`translate(${scaleX()(to)},10)`}>
        <rect
          x="0"
          width={scaleX()(from) - scaleX()(to)}
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
          x={(scaleX()(from) - scaleX()(to)) / 2}
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
        // onDrag={handleOnStartResizing}
        onDrop={handleOnStopResizing}
      />
      {!isBlockedByEditing ? <DeleteButton /> : null}
      {signal && signal.length > 0
        ? signal.map((_signal, i) => (
            <MultiplicityTree
              rangeFrom={from}
              rangeTo={to}
              signal={_signal}
              signalID={buildID(id, i)}
              key={buildID(id, i)}
            />
          ))
        : null}
    </g>
  );
};

export default Range;
