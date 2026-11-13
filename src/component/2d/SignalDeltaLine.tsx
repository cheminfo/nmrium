import styled from '@emotion/styled';
import { assert } from '@zakodium/utils';
import type { CSSProperties } from 'react';

import { useChartData } from '../context/ChartContext.js';

import { useScale2DX, useScale2DY } from './utilities/scale.js';

const SignalLine = styled.line`
  opacity: 0.5;
  stroke-width: 2;
`;

interface SignalDeltaLineProps {
  delta: number;
  axis: 'X' | 'Y';
  show: boolean;
  color?: string;
  style?: CSSProperties;
}

function SignalDeltaLine(props: SignalDeltaLineProps) {
  const { delta, axis, show, color = 'green', style } = props;
  const { xDomain, yDomain } = useChartData();
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  if (!show) return null;

  if (axis === 'X') {
    return (
      <SignalLine
        key={`signalLine_${delta}_X`}
        stroke={color}
        style={style}
        x1={scaleX(delta)}
        x2={scaleX(delta)}
        y1={scaleY(yDomain[0])}
        y2={scaleY(yDomain[1])}
      />
    );
  } else {
    assert(axis === 'Y');
    return (
      <SignalLine
        key={`signalLine_${delta}_Y`}
        stroke={color}
        style={style}
        x1={scaleX(xDomain[0])}
        x2={scaleX(xDomain[1])}
        y1={scaleY(delta)}
        y2={scaleY(delta)}
      />
    );
  }
}

export default SignalDeltaLine;
