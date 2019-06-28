import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const XAxis = ({
  width,
  height,
  margin,
  data,
  domain,
  label,
  show,
  showGrid,
  isFID,
  onAxisDidMount,
}) => {
  const xAxis = d3
    .axisBottom()
    .ticks(10)
    .tickFormat(d3.format('0'));

  const grid = d3
    .axisBottom()
    .ticks(20)
    .tickSize(-(height - margin.top - margin.bottom))
    .tickFormat('');

  const scale = getScale(data);
  const refaxis = useRef();
  const refgrid = useRef();

  label = label ? label : isFID ? 'δ [ppm]' : 'time [s]';

  function getDomain(data = []) {
    let array = [];

    for (let d of data) {
      array = array.concat(d['x']);
    }
    return d3.extent(array);
  }

  function getScale(data) {
    const domain = getDomain(data);
    const scale = d3.scaleLinear([domain[1],domain[0]], [margin.left, width - margin.right]);

    return scale;
  }

  useEffect(() => {
    if (show) {
      d3.select(refaxis.current)
        .call(xAxis.scale(scale))
      d3.select(refgrid.current).call(grid.scale(scale));
    }

    onAxisDidMount(scale.domain());
  }, []);

  useEffect(() => {
    if (show) {
      d3.select(refaxis.current)
        .transition()
        .duration(500)
        .call(xAxis.scale(scale.domain(domain)));
    }
  }, [domain]);

  return (
    <React.Fragment>
      {show ? (
         
        <g
          className="x axis"
          transform={`translate(0,${height - margin.bottom})`}
          ref={refaxis}
        >
          <text fill= "#000" x={width - 60}  y ="20" dy="0.71em"  text-anchor= "end" >{label}</text>
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

XAxis.propTypes = {
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
  isFID: PropTypes.bool,
  onAxisDidMount: PropTypes.func,
};

XAxis.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  showGrid: false,
  show: true,
  label: '',
  isFID: true,
  onAxisDidMount: () => {
    return null;
  },
};
