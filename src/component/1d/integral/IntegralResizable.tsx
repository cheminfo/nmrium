/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { Integral } from 'nmr-processing';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { ResizerWithScale } from '../../elements/ResizerWithScale.js';
import { HighlightEventSource, useHighlight } from '../../highlight/index.js';
import { useResizerStatus } from '../../hooks/useResizerStatus.js';

import { IntegralIndicator } from './IntegralIndicator.js';

const stylesOnHover = css`
  .highlight {
    fill: transparent;
  }

  .target {
    visibility: hidden;
  }
`;

const stylesHighlighted = css`
  fill: #ff6f0057;

  .target {
    visibility: visible;
  }
`;

interface IntegralResizableProps {
  integralData: Integral;
  integralFormat: string;
}

function IntegralResizable({
  integralData,
  integralFormat,
}: IntegralResizableProps) {
  const { height, margin } = useChartData();
  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();
  const { id, integral, to, from } = integralData;
  const highlight = useHighlight([id], {
    type: HighlightEventSource.INTEGRAL,
    extra: { id },
  });

  function handleOnStopResizing(position) {
    dispatch({
      type: 'RESIZE_INTEGRAL',
      payload: {
        integral: {
          ...integralData,
          from: scaleX().invert(position.x2),
          to: scaleX().invert(position.x1),
        },
      },
    });
  }

  const bottom = height - margin.bottom;

  const isResizingActive = useResizerStatus('integral');

  return (
    <g
      onMouseEnter={() => highlight.show()}
      onMouseLeave={() => highlight.hide()}
    >
      <ResizerWithScale
        from={from}
        to={to}
        onEnd={handleOnStopResizing}
        disabled={!isResizingActive}
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
              <IntegralIndicator
                value={integral}
                format={integralFormat}
                width={width}
              />
            </g>
          );
        }}
      </ResizerWithScale>
    </g>
  );
}

export default IntegralResizable;
