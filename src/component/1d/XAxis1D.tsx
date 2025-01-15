import styled from '@emotion/styled';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

import { useChartData } from '../context/ChartContext.js';
import { useScale } from '../context/ScaleContext.js';
import { AxisGroup } from '../elements/AxisGroup.js';

const GridGroup = styled.g`
  user-select: none;

  line {
    stroke: rgb(104 104 104);
    stroke-opacity: 0.2;
    shape-rendering: crispedges;
    stroke-dasharray: 3;
    stroke-width: 1;
    user-select: none;
  }

  path {
    stroke-width: 0;
  }
`;

interface XAxisProps {
  show?: boolean;
  showGrid?: boolean;
  label?: string;
}

export function XAxis1D(props: XAxisProps) {
  const { show = true, showGrid = false, label: labelProp } = props;
  const { xDomain, height, width, margin, mode } = useChartData();
  const { scaleX } = useScale();

  const refAxis = useRef<SVGGElement>(null);
  const refGrid = useRef<SVGGElement>(null);

  const label = labelProp || (mode === 'RTL' ? 'δ [ppm]' : 'time [s]');

  useEffect(() => {
    if (!show || !scaleX) return;

    const xAxis = d3
      .axisBottom(scaleX().domain(xDomain))
      .ticks(8)
      .tickFormat(d3.format('0'));

    const grid = d3
      .axisBottom(scaleX().domain(xDomain))
      .ticks(50)
      .tickSize(-(height - margin.top - margin.bottom))
      .tickFormat(() => '');

    // @ts-expect-error This line of code is actually well typed ...
    d3.select(refAxis.current).call(xAxis);

    // @ts-expect-error This line of code is actually well typed ...
    d3.select(refGrid.current).call(grid);
  }, [height, margin.bottom, margin.top, scaleX, show, xDomain]);

  if (!width || !height || !scaleX) {
    return null;
  }

  return (
    <>
      {show && (
        <AxisGroup
          className="x"
          transform={`translate(0,${height - margin.bottom})`}
          ref={refAxis}
        >
          <text fill="#000" x={width - 10} y="30" dy="0.70em" textAnchor="end">
            {label}
          </text>
        </AxisGroup>
      )}
      {showGrid && (
        <GridGroup
          data-no-export="true"
          className="grid"
          ref={refGrid}
          transform={`translate(0,${height - margin.bottom})`}
        />
      )}
    </>
  );
}
