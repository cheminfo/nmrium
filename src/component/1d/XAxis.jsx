import { css } from '@emotion/react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { useEffect, useRef, useMemo } from 'react';
/** @jsxImportSource @emotion/react */

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';

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

const gridStyles = css`
  user-select: none;

  line {
    stroke: rgb(104, 104, 104);
    stroke-opacity: 0.2;
    shape-rendering: crispEdges;
    stroke-dasharray: 3;
    stroke-width: 1;
    user-select: none;
  }

  path {
    stroke-width: 0;
  }
`;

const XAxis = ({ label, show, showGrid, mode }) => {
  const { xDomain, height, width, margin } = useChartData();
  const { scaleX } = useScale();

  const refAxis = useRef();
  const refGrid = useRef();

  label = label ? label : mode === 'RTL' ? 'δ [ppm]' : 'time [s]';

  useEffect(() => {
    const xAxis = d3.axisBottom().ticks(8).tickFormat(d3.format('0'));
    const grid = d3
      .axisBottom()
      .ticks(50)
      .tickSize(-(height - margin.top - margin.bottom))
      .tickFormat('');
    if (show && scaleX) {
      d3.select(refAxis.current).call(xAxis.scale(scaleX().domain(xDomain)));
      d3.select(refGrid.current).call(grid.scale(scaleX().domain(xDomain)));
    }
  }, [height, margin.bottom, margin.top, scaleX, show, xDomain]);

  const Axis = useMemo(
    () =>
      show &&
      show === true && (
        <g
          className="x"
          css={axisStyles}
          transform={`translate(0,${height - margin.bottom})`}
          ref={refAxis}
        >
          <text fill="#000" x={width - 10} y="30" dy="0.70em" textAnchor="end">
            {label}
          </text>
        </g>
      ),

    [height, label, margin.bottom, show, width],
  );

  const Grid = useMemo(
    () =>
      showGrid &&
      showGrid === true && (
        <g
          css={gridStyles}
          className="grid"
          ref={refGrid}
          transform={`translate(0,${height - margin.bottom})`}
        />
      ),

    [showGrid, height, margin.bottom],
  );
  if (!width || !height || !scaleX) {
    return null;
  }

  return (
    <>
      {Axis}
      {Grid}
    </>
  );
};

XAxis.propTypes = {
  showGrid: PropTypes.bool,
  show: PropTypes.bool,
  label: PropTypes.string,
};

XAxis.defaultProps = {
  showGrid: false,
  show: true,
  label: '',
};

export default XAxis;
