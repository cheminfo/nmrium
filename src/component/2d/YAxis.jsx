import { Fragment, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useChartData } from '../context/ChartContext';

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

const YAxis = ({ show, label, margin, data }) => {
  const refAxis = useRef();
  const {
    yDomain,
    scaleX,
    width,
    height,
    activeTab,
    tabActiveSpectrum,
  } = useChartData();
  const axis = d3
    .axisRight()
    .ticks(8)
    .tickFormat(d3.format('0'));

  useEffect(() => {
    if (show && yDomain && scaleX()) {
      let scale;
      const nucleus = activeTab.split(',')[1];
      scale =
        nucleus && tabActiveSpectrum[nucleus]
          ? scaleX(tabActiveSpectrum[nucleus].id, 'V')
          : scaleX(null, 'V');

      d3.select(refAxis.current).call(axis.scale(scale));
    }
  }, [show, yDomain, scaleX, data, activeTab, tabActiveSpectrum, axis]);

  const Axis = useMemo(
    () =>
      show &&
      show === true && (
        <Fragment>
          <g
            className="y"
            css={axisStyles}
            transform={`translate(${width - margin.right})`}
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
        </Fragment>
      ),

    [label, margin.right, margin.top, show, width],
  );

  if (!width || !height) {
    return null;
  }

  return Axis;
};

export default YAxis;

YAxis.contextTypes = {
  showGrid: PropTypes.bool,
  show: PropTypes.bool,
  label: PropTypes.string,
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
};

YAxis.defaultProps = {
  showGrid: false,
  show: true,
  label: '',
};
