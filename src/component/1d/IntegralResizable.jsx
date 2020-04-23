import { jsx, css } from '@emotion/core';
import * as d3 from 'd3';
import { useCallback, useState, Fragment, useMemo } from 'react';
import Draggable from 'react-draggable';
/** @jsx jsx */

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useScale } from '../context/ScaleContext';
import { useHighlight } from '../highlight/index';
import { RESIZE_INTEGRAL, DELETE_INTEGRAL } from '../reducer/types/Types';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
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

  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  fill: #ff6f0057;

  .target {
    visibility: visible;
  }
`;

const IntegralResizable = ({ spectrumID, integralSeries, integralData }) => {
  const { height, margin, mode } = useChartData();
  const { scaleX } = useScale();

  const { from, to, id, value } = integralData;
  const [rightDragVisibility, setRightDragVisibility] = useState(false);
  const [leftDragVisibility, setLeftDragVisibility] = useState(false);

  const highlight = useHighlight([id]);

  const xBoundary = useMemo(() => {
    if (integralSeries) {
      return d3.extent(integralSeries.x);
    } else {
      return [];
    }
  }, [integralSeries]);

  const dispatch = useDispatch();

  const deleteIntegral = useCallback(() => {
    dispatch({
      type: DELETE_INTEGRAL,
      integralID: id,
      spectrumID: spectrumID,
    });
  }, [dispatch, id, spectrumID]);

  function DeleteButton() {
    return (
      <svg
        className="target"
        x={scaleX()(xBoundary[1]) - 20}
        y={height - margin.bottom - 20}
        // transform={`translate(${scaleX()(xBoundary[1]) - 20}px,${height -
        //   margin.bottom -
        //   20}px)`}
        onClick={deleteIntegral}
        data-no-export="true"
        width="16"
        height="16"
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
          ? [scaleX().invert(e.layerX), to]
          : [to, scaleX().invert(e.layerX)];

      if (range[1] > range[0]) {
        const integral = {
          from: range[0],
          to: range[1],
          id,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      } else {
        const integral = {
          from,
          to,
          id,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      }
    },
    [dispatch, from, scaleX, id, mode, to],
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
          ? [from, scaleX().invert(e.layerX)]
          : [scaleX().invert(e.layerX), from];

      if (range[1] > range[0]) {
        const integral = {
          from: range[0],
          to: range[1],
          id,
        };
        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      } else {
        const integral = {
          from,
          to,
          id,
        };

        dispatch({
          type: RESIZE_INTEGRAL,
          integral,
        });
      }
    },
    [dispatch, from, scaleX, id, mode, to],
  );

  return (
    <Fragment>
      <g
        css={highlight.isActive ? stylesHighlighted : stylesOnHover}
        data-no-export="true"
        {...highlight.onHover}
      >
        <rect
          x={scaleX()(xBoundary[1])}
          y="0"
          width={scaleX()(xBoundary[0]) - scaleX()(xBoundary[1])}
          height={height - margin.bottom}
          className="highlight"
        />
        {highlight.isActive && (
          <text
            x={scaleX()(xBoundary[1])}
            y={height - margin.bottom + 30}
            fill="black"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
          >
            {value.toFixed(2)}
          </text>
        )}
        <Draggable
          axis="x"
          defaultPosition={{
            x: scaleX()(xBoundary[0]),
            y: 0,
          }}
          position={{
            x: scaleX()(xBoundary[0]),
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
            x: scaleX()(xBoundary[1]),
            y: 0,
          }}
          position={{
            x: scaleX()(xBoundary[1]),
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
      </g>
    </Fragment>
  );
};

export default IntegralResizable;
