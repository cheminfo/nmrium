import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { useCallback, useState, useEffect } from 'react';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useScale } from '../context/ScaleContext';
import { useHighlight } from '../highlight';
import { HighlightSignalConcatenation } from '../panels/extra/constants/ConcatenationStrings';
import { SignalKindsToConsiderInIntegralsSum } from '../panels/extra/constants/SignalsKinds';
import { checkSignalKinds } from '../panels/extra/utilities/RangeUtilities';
import {
  DELETE_RANGE,
  RESIZE_RANGE,
  UNSET_ACTIVE_ASSIGNMENT_AXIS,
  SET_ACTIVE_ASSIGNMENT_AXIS,
} from '../reducer/types/Types';

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
  const highlightRange = useHighlight([id]);

  const { scaleX } = useScale();
  const { editRangeModalMeta } = useChartData();
  const dispatch = useDispatch();

  const [reduceOpacity, setReduceOpacity] = useState(false);

  useEffect(() => {
    setReduceOpacity(
      !checkSignalKinds(rangeData, SignalKindsToConsiderInIntegralsSum),
    );
  }, [rangeData]);

  const deleteRange = useCallback(() => {
    dispatch({ type: DELETE_RANGE, rangeID: id });
  }, [dispatch, id]);

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
        onClick={() => deleteRange()}
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
        (editRangeModalMeta &&
          editRangeModalMeta.rangeInEdition &&
          editRangeModalMeta.rangeInEdition === id) ||
        highlightRange.isActive ||
        highlightRange.isActivePermanently
          ? stylesHighlighted
          : stylesOnHover
      }
      key={id}
      {...highlightRange.onHover}
      {...{
        onClick:
          editRangeModalMeta && editRangeModalMeta.rangeInEdition
            ? null
            : (e) => {
                if (e.shiftKey) {
                  if (highlightRange.isActivePermanently) {
                    dispatch({ type: UNSET_ACTIVE_ASSIGNMENT_AXIS });
                  } else {
                    dispatch({ type: SET_ACTIVE_ASSIGNMENT_AXIS, axis: 'X' });
                  }
                  highlightRange.click(e);
                }
              },
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
            highlightRange.isActivePermanently
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
            highlightRange.isActivePermanently
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
      {!editRangeModalMeta || !editRangeModalMeta.rangeInEdition ? (
        <DeleteButton />
      ) : null}
      {signal && signal.length > 0
        ? signal.map((_signal, i) => (
            <MultiplicityTree
              rangeFrom={from}
              rangeTo={to}
              signal={_signal}
              highlightID={`${id}${HighlightSignalConcatenation}${i}`}
              // eslint-disable-next-line react/no-array-index-key
              key={`${id}${HighlightSignalConcatenation}${i}`}
            />
          ))
        : null}
    </g>
  );
};

export default Range;
