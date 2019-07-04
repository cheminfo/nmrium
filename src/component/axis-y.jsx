import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const YAxis = ({
  width,
  height,
  margin,
  show,
  label,
  domain,
}) => {
  const refaxis = useRef();


  useEffect(() => {


    if (show) {
      const scale = d3.scaleLinear(domain, [height - margin.bottom, margin.top]);
      const axis = d3
      .axisLeft()
      .ticks(10)
      .tickFormat(d3.format('~s'));
      d3.select(refaxis.current).call(axis.scale(scale));
    }

   
  }, [domain]);

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
          text-anchor="end"
        >
          {label}
        </text>
      </g>
    </React.Fragment>
  ) : null;
};

export default YAxis;

YAxis.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  showGrid: PropTypes.bool,
  show: PropTypes.bool,
  label: PropTypes.string,
};

YAxis.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  showGrid: false,
  show: true,
  label: '',
};
