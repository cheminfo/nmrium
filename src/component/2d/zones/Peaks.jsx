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

  const peaks = signal.reduce((acc, item) => (acc = acc.concat(item.peak)), []);
  return (
    <g className="zone-peaks">
      {peaks.map((peak) => {
        const x = scaleX(peak.x);
        const y = scaleY(peak.y);
        return (
          <circle
            key={`${peak.x}${peak.y}${peak.z}`}
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
