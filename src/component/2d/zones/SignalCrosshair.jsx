/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useChartData } from '../../context/ChartContext';
import { useHighlight } from '../../highlight';
import { get2DXScale, get2DYScale } from '../utilities/scale';

const lineStyle = css`
  stroke: green;
  stroke-width: 2;
  opacity: 0.5;
`;

function SignalCrosshair({ signal }) {
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  const highlight = useHighlight([`${signal.id}_Crosshair`]);

  return (
    highlight.isActive && (
      <g>
        <line
          css={lineStyle}
          key="crosshairLineX"
          x1={scaleX(signal.x.delta)}
          x2={scaleX(signal.x.delta)}
          y1={scaleY(yDomain[0])}
          y2={scaleY(yDomain[1])}
        />
        <line
          css={lineStyle}
          key="crosshairLineY"
          x1={scaleX(xDomain[0])}
          x2={scaleX(xDomain[1])}
          y1={scaleY(signal.y.delta)}
          y2={scaleY(signal.y.delta)}
        />
      </g>
    )
  );
}

export default SignalCrosshair;
