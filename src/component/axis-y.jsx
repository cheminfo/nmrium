import React, {useEffect } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

const YAxis = ({ width, height, margin, data, show, label,onAxisDidMount }) => {

  const axis = d3.axisLeft().ticks(10).tickFormat(d3.format("~s"));;
  const scale = getScale(data);


  function getDomain(data = []) {
    let array = [];
    for (let d of data) {
      array = array.concat(d["y"]);
    }
    return d3.extent(array);
  }

   function getScale(data){
    const domain = getDomain(data);

    const scale = d3.scaleLinear(domain, [height - margin.bottom, margin.top]);

    return scale;
  }

  useEffect(() => {
    if (show) {
      d3.select(".y")
        .call(axis.scale(scale))
        .append("text")
        .attr("fill", "#000")
        .attr("y", -(margin.left - 5))
        .attr("transform", "rotate(-90)")
        .attr("x", -(margin.top + 20))
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(label);
    }

    onAxisDidMount(scale.domain());

  });
 
  return ( (show) ? <g className="y axis" transform={`translate(${margin.left},0)`} /> :null);
}


export default YAxis;


YAxis.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired
  }),
  showGrid: PropTypes.bool,
  show:PropTypes.bool,
  label: PropTypes.string,
  onAxisDidMount: PropTypes.func
};

YAxis.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  showGrid: false,
  show:true,
  label: "",
  onAxisDidMount: () => {
    return null;
  }
};
