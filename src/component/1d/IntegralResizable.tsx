/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useState, useEffect } from 'react';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useScaleChecked } from '../context/ScaleContext';
import { HighlightedSource, useHighlight } from '../highlight/index';
import { RESIZE_INTEGRAL } from '../reducer/types/Types';

import Resizable from './Resizable';

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

interface IntegralResizableProps {
  integralData: {
    id: string;
    from: number;
    to: number;
    integral?: number;
  };
}

function IntegralResizable({ integralData }: IntegralResizableProps) {
  const { height, margin } = useChartData();
  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();

  const [{ id, integral, from, to }, setIntegral] = useState(integralData);
  const highlight = useHighlight([id], {
    type: HighlightedSource.INTEGRAL,
    extra: { id },
  });

  useEffect(() => {
    setIntegral(integralData);
  }, [integralData]);

  const handleOnStopResizing = useCallback(
    (resized) => {
      dispatch({
        type: RESIZE_INTEGRAL,
        payload: { data: { ...integralData, ...resized } },
      });
    },
    [dispatch, integralData],
  );

  const handleOnEnterNotation = useCallback(() => {
    highlight.show();
  }, [highlight]);

  const handleOnMouseLeaveNotation = useCallback(() => {
    highlight.hide();
  }, [highlight]);

  const dragHandler = useCallback((boundary) => {
    setIntegral((integral) => ({ ...integral, ...boundary }));
  }, []);

  const x0 = from ? scaleX()(from) : 0;
  const x1 = to ? scaleX()(to) : 0;

  return (
    <g
      css={highlight.isActive ? stylesHighlighted : stylesOnHover}
      onMouseEnter={handleOnEnterNotation}
      onMouseLeave={handleOnMouseLeaveNotation}
    >
      <rect
        data-no-export="true"
        x={`${x1}`}
        y="0"
        width={`${x0 - x1}`}
        height={height - margin.bottom}
        className="highlight"
      />
      {/* {highlight.isActive && ( */}
      <text
        x={x1}
        y={height - margin.bottom + 30}
        fill="black"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {integral !== undefined ? integral.toFixed(2) : ''}
      </text>
      {/* )} */}
      <Resizable
        from={integralData.from}
        to={integralData.to}
        onDrag={dragHandler}
        onDrop={handleOnStopResizing}
        data-no-export="true"
      />
    </g>
  );
}

export default IntegralResizable;
