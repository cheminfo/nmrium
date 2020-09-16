/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext';
import { get2DXScale, get2DYScale } from '../utilities/scale';

const Peaks = memo(({ signal }) => {
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const scaleX = get2DXScale({ margin, width, xDomain });
  const scaleY = get2DYScale({ margin, height, yDomain });

  if (!signal) return null;

  return (
    <g className="zone-peaks">
      {signal.map((signalItem) => {
        const x = scaleX(signalItem.x.delta);
        const y = scaleY(signalItem.y.delta);
        return (
          <circle
            key={`${signalItem.x.delta}${signalItem.y.delta}`}
            cx={x}
            cy={y}
            r={3}
            fill="darkgreen"
          />
        );
      })}
    </g>
  );
});

export default Peaks;
