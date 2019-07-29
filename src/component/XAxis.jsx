import React, { useEffect, useRef, useContext } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import {ChartContext} from './context/ChartContext';

const XAxis = ({
  label,
  show,
  showGrid,
  isFID,
}) => {

  const {height,margin,xDomain,width,getScale} = useContext(ChartContext); 
  const refaxis = useRef();
  const refgrid = useRef();
  // const scale = getScale(data);

  label = label ? label : isFID ? 'δ [ppm]' : 'time [s]';

  const xAxis = d3
    .axisBottom()
    .ticks(8)
    .tickFormat(d3.format('0'));

  const grid = d3
    .axisBottom()
    .ticks(10)
    .tickSize(-(height - margin.top - margin.bottom))
    .tickFormat('');



  // function getScale(data) {
  //   const scale = d3.scaleLinear(
  //     [domain[0], domain[1]],
  //     [width - margin.right,margin.left],
  //   );

  //   return scale;
  // }

  useEffect(() => {
    
    if (show) {
      const scale = d3.scaleLinear(
        [xDomain[0], xDomain[1]],
        [width - margin.right, margin.left],
      );
      d3.select(refaxis.current).call(xAxis.scale(scale));
      d3.select(refgrid.current).call(grid.scale(scale));
    }
  }, []);

  useEffect(() => {
    if (show) {
      // const scale = d3.scaleLinear(
      //   [domain[0], domain[1]],
      //   [width - margin.right, margin.left],
      // );
      const scale = getScale();
      d3.select(refaxis.current)
        // .transition()
        // .duration(500)
        .call(xAxis.scale(scale.x.domain(xDomain)));

      d3.select(refgrid.current).call(grid.scale(scale.x.domain(xDomain)));
    }
  }, [xDomain, height, width]);

  return (
    <React.Fragment>
      {show ? (
        <g
          className="x axis"
          transform={`translate(0,${height - margin.bottom})`}
          ref={refaxis}
        >
          <text fill="#000" x={width - 60} y="20" dy="0.71em" textAnchor="end">
            {label}
          </text>
        </g>
      ) : null}
      {showGrid ? (
        <g
          className="grid"
          ref={refgrid}
          transform={`translate(0,${height - margin.bottom})`}
        />
      ) : null}
    </React.Fragment>
  );
};

export default XAxis;

XAxis.contextTypes = {
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
  isFID: PropTypes.bool,
};

XAxis.defaultProps = {
  showGrid: false,
  show: true,
  label: '',
  isFID: true,
};
