/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { useEffect, useRef, useMemo } from 'react';

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

function YAxis(props) {
  const { show = true, label = '' } = props;
  const refAxis = useRef();
  const { yDomain, width, height, margin } = useChartData();
  const { scaleY } = useScale();

  useEffect(() => {
    if (show && yDomain && scaleY()) {
      const axis = d3.axisRight().ticks(10).tickFormat(d3.format('~s'));

      d3.select(refAxis.current).call(axis.scale(scaleY()));
    }
  }, [show, yDomain, scaleY]);

  const Axis = useMemo(
    () =>
      show && (
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
      ),

    [label, margin.right, margin.top, show, width],
  );

  if (!width || !height) {
    return null;
  }

  return Axis;
}

export default YAxis;

YAxis.contextTypes = {
  show: PropTypes.bool,
  label: PropTypes.string,
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
};
