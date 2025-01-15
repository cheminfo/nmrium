import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

import { useChartData } from '../context/ChartContext.js';
import { useScale } from '../context/ScaleContext.js';
import { AxisGroup } from '../elements/AxisGroup.js';

interface YAxisProps {
  show?: boolean;
  label?: string;
}

function YAxis(props: YAxisProps) {
  const { show = true, label = '' } = props;
  const refAxis = useRef<SVGGElement>(null);

  const { yDomain, width, height, margin } = useChartData();
  const { scaleY } = useScale();

  useEffect(() => {
    if (show && yDomain && scaleY) {
      const axis = d3.axisRight(scaleY()).ticks(10).tickFormat(d3.format('~s'));

      // @ts-expect-error this line of code is well typed
      d3.select(refAxis.current).call(axis);
    }
  }, [show, yDomain, scaleY]);

  if (!width || !height) {
    return null;
  }

  return (
    <>
      {show && (
        <AxisGroup
          className="y"
          transform={`translate(${width - 50})`}
          ref={refAxis}
        >
          <text
            fill="#000"
            x={-margin.top}
            y={-(margin.right - 5)}
            dy="0.71em"
            transform="rotate(-90)"
            textAnchor="end"
          >
            {label}
          </text>
        </AxisGroup>
      )}
    </>
  );
}

export default YAxis;
