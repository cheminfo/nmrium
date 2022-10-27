/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, useCallback } from 'react';

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

const styles: Record<'text' | 'path', CSSProperties> = {
  text: {
    fontSize: '11px',
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    writingMode: 'vertical-rl',
    fill: 'black',
  },
  path: {
    fill: 'none',
    stroke: 'black',
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
  },
};

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

  const bottom = height - margin.bottom;

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
        {({ x1, x2 }, isActive) => {
          const width = x2 - x1;

          return (
            <g
              css={
                highlight.isActive || isActive
                  ? stylesHighlighted
                  : stylesOnHover
              }
            >
              <rect
                width={width}
                height={bottom}
                className="highlight"
                data-no-export="true"
              />
              <g style={{ transform: `translate(0,${bottom - 15}px) ` }}>
                <text
                  style={{
                    ...styles.text,
                    transform: `translate(${width / 2}px,-5px) scale(-1)`,
                  }}
                >
                  {integral ? formatNumber(integral, integralFormat) : ''}
                </text>
                <path
                  style={styles.path}
                  d={`M0 0 L0 10 L${width} 10 L${width} 0 `}
                />
              </g>
            </g>
          );
        }}
      </Resizer>
    </g>
  );
}

export default IntegralResizable;
