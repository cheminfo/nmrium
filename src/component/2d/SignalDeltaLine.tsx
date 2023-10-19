/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useChartData } from '../context/ChartContext';

import { useScale2DX, useScale2DY } from './utilities/scale';

const lineStyle = css`
  stroke: green;
  stroke-width: 2;
  opacity: 0.5;
`;

interface SignalDeltaLineProps {
  delta: number;
  axis: 'X' | 'Y';
  show: boolean;
}

function SignalDeltaLine({ delta, axis, show }: SignalDeltaLineProps) {
  const { xDomain, yDomain } = useChartData();
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  if (!show) return null;

  if (axis === 'X') {
    return (
      <line
        css={lineStyle}
        key={`signalLine_${delta}_X`}
        x1={scaleX(delta)}
        x2={scaleX(delta)}
        y1={scaleY(yDomain[0])}
        y2={scaleY(yDomain[1])}
      />
    );
  }

  if (axis === 'Y') {
    return (
      <line
        css={lineStyle}
        key={`signalLine_${delta}_Y`}
        x1={scaleX(xDomain[0])}
        x2={scaleX(xDomain[1])}
        y1={scaleY(delta)}
        y2={scaleY(delta)}
      />
    );
  }
}

export default SignalDeltaLine;
