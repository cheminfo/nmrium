import React, { useEffect, useRef, useContext, useMemo } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { ChartContext } from './context/ChartContext';

const YAxis = ({ show, label }) => {
  const refAxis = useRef();

  const { margin, yDomain, getScale } = useContext(ChartContext);

  useEffect(() => {
    if (show) {
      // const scale = d3.scaleLinear([0,domain[1]], [height - margin.bottom, margin.top]);
      const scale = getScale();
      console.log('7');
      const axis = d3
      .axisLeft()
      .ticks(5)
      .tickFormat(d3.format('~s'));
  
      // d3.select(refAxis.current)
      //   .selectAll('*')
      //   .remove();
      d3.select(refAxis.current).call(axis.scale([0,scale.y[1]]));
    }
  }, [show,yDomain,getScale]);

  const Axis = useMemo(
    () =>
      show &&
      show === true && (
        <React.Fragment>
          <g
            className="y axis"
            transform={`translate(${margin.left + 30},0)`}
            ref={refAxis}
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
      ),

    [label, margin, show],
  );

  return Axis;
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
