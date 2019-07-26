import React, { useEffect, useRef, useContext } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { ChartContext } from './context/chart-context';

const YAxis = ({ show, label }) => {
  const refaxis = useRef();
  const { width, height, margin, yDomain, getScale } = useContext(ChartContext);

  useEffect(() => {
    if (show) {
      // const scale = d3.scaleLinear([0,domain[1]], [height - margin.bottom, margin.top]);
      const scale = getScale();
      const axis = d3
        .axisLeft()
        .ticks(10)
        .tickFormat(d3.format('~s'));
      d3.select(refaxis.current).call(axis.scale(scale.y));
    }
  }, [width, height, yDomain, show, getScale]);

  return show ? (
    <React.Fragment>
      <g
        className="y axis"
        transform={`translate(${margin.left},0)`}
        ref={refaxis}
      >
        <text
          fill="#000"
          x={-(margin.top + 20)}
          y={-(margin.left - 5)}
          dy="0.71em"
          transform="rotate(-90)"
          textAnchor="end"
        >
          {label}
        </text>
      </g>
    </React.Fragment>
  ) : null;
};

export default YAxis;

YAxis.contextTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  showGrid: PropTypes.bool,
  show: PropTypes.bool,
  label: PropTypes.string,
  getScale: PropTypes.func,
};

YAxis.defaultProps = {
  showGrid: false,
  show: true,
  label: '',
};
