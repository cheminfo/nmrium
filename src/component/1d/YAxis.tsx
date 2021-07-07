/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';

const axisStyles = css`
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  path,
  line {
    fill: none;
    stroke: black;
    stroke-width: 1;
    shape-rendering: crispEdges;
    user-select: 'none';
    -webkit-user-select: none; /* Chrome all / Safari all */
    -moz-user-select: none; /* Firefox all */
  }
`;

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
        <g
          className="y"
          css={axisStyles}
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
        </g>
      )}
    </>
  );
}

export default YAxis;
