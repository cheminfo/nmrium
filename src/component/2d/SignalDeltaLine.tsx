/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

import { get2DXScale, get2DYScale } from './utilities/scale';

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
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  const line = useMemo(() => {
    return show ? (
      axis === 'X' ? (
        <line
          css={lineStyle}
          key={`signalLine_${delta}_X`}
          x1={scaleX(delta)}
          x2={scaleX(delta)}
          y1={scaleY(yDomain[0])}
          y2={scaleY(yDomain[1])}
        />
      ) : axis === 'Y' ? (
        <line
          css={lineStyle}
          key={`signalLine_${delta}_Y`}
          x1={scaleX(xDomain[0])}
          x2={scaleX(xDomain[1])}
          y1={scaleY(delta)}
          y2={scaleY(delta)}
        />
      ) : null
    ) : null;
  }, [axis, delta, scaleX, scaleY, show, xDomain, yDomain]);

  return <g>{line}</g>;
}

export default SignalDeltaLine;
