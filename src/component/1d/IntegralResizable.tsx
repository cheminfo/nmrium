/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback } from 'react';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useGlobal } from '../context/GlobalContext';
import { useScaleChecked } from '../context/ScaleContext';
import Resizer from '../elements/resizer/Resizer';
import { HighlightEventSource, useHighlight } from '../highlight/index';
import { RESIZE_INTEGRAL } from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';
import { formatNumber } from '../utility/formatNumber';

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
  integralFormat: string;
}

function IntegralResizable({
  integralData,
  integralFormat,
}: IntegralResizableProps) {
  const {
    height,
    margin,
    toolOptions: { selectedTool },
  } = useChartData();
  const { viewerRef } = useGlobal();
  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();
  const { id, integral } = integralData;
  const highlight = useHighlight([id], {
    type: HighlightEventSource.INTEGRAL,
    extra: { id },
  });

  const handleOnStopResizing = useCallback(
    (position) => {
      dispatch({
        type: RESIZE_INTEGRAL,
        payload: {
          data: {
            ...integralData,
            from: scaleX().invert(position.x2),
            to: scaleX().invert(position.x1),
          },
        },
      });
    },
    [dispatch, integralData, scaleX],
  );

  const handleOnEnterNotation = useCallback(() => {
    highlight.show();
  }, [highlight]);

  const handleOnMouseLeaveNotation = useCallback(() => {
    highlight.hide();
  }, [highlight]);

  const from = integralData.from ? scaleX()(integralData.from) : 0;
  const to = integralData.to ? scaleX()(integralData.to) : 0;

  return (
    <g
      onMouseEnter={handleOnEnterNotation}
      onMouseLeave={handleOnMouseLeaveNotation}
    >
      <Resizer
        tag="svg"
        initialPosition={{ x1: to, x2: from }}
        onEnd={handleOnStopResizing}
        parentElement={viewerRef}
        key={`${id}_${to}_${from}`}
        disabled={selectedTool !== options.integral.id}
      >
        {({ x1, x2 }, isActive) => (
          <g
            css={
              highlight.isActive || isActive ? stylesHighlighted : stylesOnHover
            }
          >
            <rect
              x="0"
              y="0"
              width={x2 - x1}
              height={height - margin.bottom}
              className="highlight"
              data-no-export="true"
            />
            <text
              x={0}
              y={height - margin.bottom + 30}
              fill="black"
              style={{ fontSize: '12px', fontWeight: 'bold' }}
            >
              {integral !== undefined
                ? formatNumber(integral, integralFormat)
                : ''}
            </text>
          </g>
        )}
      </Resizer>
    </g>
  );
}

export default IntegralResizable;
