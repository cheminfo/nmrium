import { jsx, css } from '@emotion/core';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { useEffect, useRef, useMemo, memo } from 'react';
/** @jsx jsx */

import { useChartData } from '../context/ChartContext';
import { get2DXScale } from '../reducer/core/scale';

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

const XAxis = memo(({ show, label, margin: marginProps }) => {
  const state = useChartData();
  const {
    xDomain,
    height,
    width,
    margin,
    tabActiveSpectrum,
    activeTab,
  } = state;

  const refAxis = useRef();

  useEffect(() => {
    const xAxis = d3.axisBottom().ticks(8).tickFormat(d3.format('0'));

    if (show) {
      const scaleX = get2DXScale({ width, margin, xDomain });
      d3.select(refAxis.current).call(xAxis.scale(scaleX));
    }
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

  const Axis = useMemo(
    () =>
      show &&
      show === true && (
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
      ),

    [height, label, margin.bottom, marginProps.bottom, show, width],
  );

  if (!width || !height) {
    return null;
  }

  return Axis;
});

XAxis.propTypes = {
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  show: PropTypes.bool,
  label: PropTypes.string,
};

XAxis.defaultProps = {
  show: true,
  label: 'δ [ppm]',
  margin: { right: 100, top: 0, left: 0, bottom: 0 },
};

export default XAxis;
