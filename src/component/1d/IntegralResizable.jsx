import { useCallback, useState, Fragment, useMemo } from 'react';
import Draggable from 'react-draggable';
import * as d3 from 'd3';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useHighlight } from '../highlight/index';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { RESIZE_INTEGRAL, DELETE_INTEGRAL } from '../reducer/types/Types';

const stylesOnHover = css`
  pointer-events: bounding-box;

  :hover .target {
    visibility: visible !important;
    cursor: pointer;
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
  fill: #ff6f0057;

  .target {
    visibility: visible;
  }
`;

const IntegralResizable = (props) => {
  const { scaleX, height, margin, mode } = useChartData();
  const { spectrumID, integralData, from, to, integralID } = props;
  const [rightDragVisibility, setRightDragVisibility] = useState(false);
  const [leftDragVisibility, setLeftDragVisibility] = useState(false);

  const highlight = useHighlight([integralID]);

  const xBoundary = useMemo(() => {
    if (integralData) {
      return d3.extent(integralData.x);
    } else {
      return [];
    }
  }, [integralData]);

  const dispatch = useDispatch();

  const deleteIntegral = useCallback(() => {
    dispatch({
      type: DELETE_INTEGRAL,
      integralID: integralID,
      spectrumID: spectrumID,
    });
  }, [dispatch, integralID, spectrumID]);

  function DeleteButton() {
    return (
      <svg
        className="target"
        x={scaleX(xBoundary[1]) - 20}
        y={height - margin.bottom - 20}
        onClick={deleteIntegral}
        data-no-export="true"
      >
        <rect rx="5" width="16" height="16" fill="#c81121" />
        <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
      </svg>
    );
  }

  const handleRightStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setRightDragVisibility(true);
  }, []);
  const handleRightDrag = useCallback(() => {
    // Empty
  }, []);
  const handleRightStop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      setRightDragVisibility(false);

      const range =
        mode === 'RTL'
          ? [scaleX.invert(e.layerX), to]
          : [to, scaleX.invert(e.layerX)];

      if (range[1] > range[0]) {
        const integral = {
          from: range[0],
          to: range[1],
          id: integralID,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      } else {
        const integral = {
          from,
          to,
          id: integralID,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      }
    },
    [dispatch, from, scaleX, integralID, mode, to],
  );
  const handleLeftStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setLeftDragVisibility(true);
  }, []);
  const handleLeftDrag = useCallback(() => {
    // Empty
  }, []);
  const handleLeftStop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      setLeftDragVisibility(false);
      const range =
        mode === 'RTL'
          ? [from, scaleX.invert(e.layerX)]
          : [scaleX.invert(e.layerX), from];

      if (range[1] > range[0]) {
        const integral = {
          from: range[0],
          to: range[1],
          id: integralID,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      } else {
        const integral = {
          from,
          to,
          id: integralID,
        };

        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      }
    },
    [dispatch, from, scaleX, integralID, mode, to],
  );

  return (
    <Fragment>
      <svg
        css={highlight.isActive ? stylesHighlighted : stylesOnHover}
        data-no-export="true"
        {...highlight.onHover}
      >
        <rect
          x={scaleX(xBoundary[1])}
          y="0"
          width={scaleX(xBoundary[0]) - scaleX(xBoundary[1])}
          height="100%"
          className="highlight"
        />
        <Draggable
          axis="x"
          defaultPosition={{
            x: scaleX(xBoundary[0]),
            y: 0,
          }}
          position={{
            x: scaleX(xBoundary[0]),
            y: 0,
          }}
          scale={1}
          onStart={handleRightStart}
          onDrag={handleRightDrag}
          onStop={handleRightStop}
        >
          <rect
            cursor="ew-resize"
            width={rightDragVisibility ? 1 : 6}
            fill="red"
            height={height + margin.top}
            style={{ fillOpacity: rightDragVisibility ? 1 : 0 }}
          />
        </Draggable>

        <Draggable
          axis="x"
          defaultPosition={{
            x: scaleX(xBoundary[1]),
            y: 0,
          }}
          position={{
            x: scaleX(xBoundary[1]),
            y: 0,
          }}
          scale={1}
          onStart={handleLeftStart}
          onDrag={handleLeftDrag}
          onStop={handleLeftStop}
        >
          <rect
            cursor="ew-resize"
            width={leftDragVisibility ? 1 : 6}
            fill="red"
            height={height + margin.top}
            style={{ fillOpacity: leftDragVisibility ? 1 : 0 }}
          />
        </Draggable>
        <DeleteButton />
      </svg>
    </Fragment>
  );
};

export default IntegralResizable;
