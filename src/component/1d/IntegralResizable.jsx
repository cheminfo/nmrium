import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import * as d3 from 'd3';
import { useCallback, Fragment, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useScale } from '../context/ScaleContext';
import { useHighlight } from '../highlight/index';
import { RESIZE_INTEGRAL, DELETE_INTEGRAL } from '../reducer/types/Types';

import Resizable from './Resizable';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  // // disabled because Resizable component appears now when hovering over it
  // :hover .target {
  //   visibility: visible !important;
  //   cursor: pointer;
  // }
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
  const { height, margin } = useChartData();
  const { scaleX } = useScale();

  const { id, integral } = integralData;

  const highlight = useHighlight([id]);

  // isn't it actually the from/to range? -> return [from, to]
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
        x={`${scaleX()(xBoundary[1]) - 20}`}
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

  // const handleOnStartResizing = useCallback(() => {}, []);

  const handleOnStopResizing = useCallback(
    (resized) => {
      dispatch({
        type: RESIZE_INTEGRAL,
        data: { ...integralData, ...resized },
      });
    },
    [dispatch, integralData],
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
          width={`${scaleX()(xBoundary[0]) - scaleX()(xBoundary[1])}`}
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
            {integral !== undefined ? integral.toFixed(2) : ''}
          </text>
        )}
        <Resizable
          from={integralData.from}
          to={integralData.to}
          // onDrag={handleOnStartResizing}
          onDrop={handleOnStopResizing}
        />
        <DeleteButton />
      </g>
    </Fragment>
  );
};

export default IntegralResizable;
