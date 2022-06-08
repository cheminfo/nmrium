/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as d3 from 'd3';
import { useEffect, useRef, memo } from 'react';

import { useChartData } from '../context/ChartContext';

import { get2DYScale } from './utilities/scale';

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

const defaultMargin = { right: 50, top: 0, bottom: 0, left: 0 };

interface YAxisProps {
  show?: boolean;
  label?: string;
  margin?: {
    right: number;
    top: number;
    bottom: number;
    left: number;
  };
}

function YAxis(props: YAxisProps) {
  const {
    show = true,
    label = '',
    margin: marginProps = defaultMargin,
  } = props;

  const refAxis = useRef<SVGGElement>(null);

  const state = useChartData();
  const { yDomain, width, height, activeTab, tabActiveSpectrum, margin } =
    state;

  useEffect(() => {
    if (!show || !yDomain) return;
    const scaleY = get2DYScale({ height, yDomain, margin });

    const axis = d3.axisRight(scaleY).ticks(8).tickFormat(d3.format('0'));

    // @ts-expect-error well typed
    d3.select(refAxis.current).call(axis);
  }, [show, yDomain, activeTab, tabActiveSpectrum, height, margin]);

  if (!width || !height) {
    return null;
  }

  return (
    <g
        className="y"
        css={axisStyles}
        transform={`translate(${width - marginProps.right})`}
        ref={refAxis}
      >
        <text
          fill="#000"
          x={-marginProps.top}
          y={-(marginProps.right - 5)}
          dy="0.71em"
          transform="rotate(-90)"
          textAnchor="end"
        >
          {label}
        </text>
      </g>
  );
}

export default memo(YAxis);
