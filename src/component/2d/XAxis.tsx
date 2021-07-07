/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as d3 from 'd3';
import { useEffect, useRef, memo } from 'react';

import { useChartData } from '../context/ChartContext';

import { get2DXScale } from './utilities/scale';

const axisStyles = css`
  user-select: none;

  path,
  line {
    fill: none;
    stroke: black;
    stroke-width: 1;
    shape-rendering: crispEdges;
    user-select: none;
  }
`;

const defaultMargin = { right: 100, top: 0, left: 0, bottom: 0 };

interface XAxisProps {
  show?: boolean;
  label?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

function XAxis(props: XAxisProps) {
  const {
    show = true,
    label = 'δ [ppm]',
    margin: marginProps = defaultMargin,
  } = props;

  const state = useChartData();
  const { xDomain, height, width, margin, tabActiveSpectrum, activeTab } =
    state;

  const refAxis = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!show) return;
    const scaleX = get2DXScale({ width, margin, xDomain });
    const xAxis = d3.axisBottom(scaleX).ticks(8).tickFormat(d3.format('0'));

    // @ts-expect-error actually well typed
    d3.select(refAxis.current).call(xAxis);
  }, [
    activeTab,
    height,
    margin,
    margin.bottom,
    margin.left,
    margin.right,
    margin.top,
    show,
    tabActiveSpectrum,
    width,
    xDomain,
  ]);

  if (!width || !height) {
    return null;
  }

  return (
    <>
      {show && (
        <g
          className="x"
          css={axisStyles}
          transform={`translate(0,${
            height - (margin.bottom + marginProps.bottom)
          })`}
          ref={refAxis}
        >
          <text fill="#000" x={width - 60} y="20" dy="0.71em" textAnchor="end">
            {label}
          </text>
        </g>
      )}
    </>
  );
}

export default memo(XAxis);
