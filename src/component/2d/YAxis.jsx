import { jsx, css } from '@emotion/core';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef, useMemo, memo } from 'react';
/** @jsx jsx */

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

const YAxis = memo(({ show, label, margin: marginProps }) => {
  const refAxis = useRef();
  const state = useChartData();
  const {
    yDomain,
    width,
    height,
    activeTab,
    tabActiveSpectrum,
    margin,
  } = state;

  useEffect(() => {
    const axis = d3.axisRight().ticks(8).tickFormat(d3.format('0'));

    if (show && yDomain) {
      const scaleY = get2DYScale({ height, yDomain, margin });
      // const scale = scaleY(null, null, true);

      d3.select(refAxis.current).call(axis.scale(scaleY));
    }
  }, [show, yDomain, activeTab, tabActiveSpectrum, height, margin]);

  const Axis = useMemo(
    () =>
      show &&
      show === true && (
        <Fragment>
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
        </Fragment>
      ),

    [label, marginProps.right, marginProps.top, show, width],
  );

  if (!width || !height) {
    return null;
  }

  return Axis;
});

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
  show: true,
  label: '',
  margin: { right: 50, top: 0, bottom: 0, left: 0 },
};
