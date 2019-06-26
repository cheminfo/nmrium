import React, { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

export default class YAxis extends Component {
  constructor(props) {
    super(props);

    const { width, height, margin, data } = this.props;
    this.width = width;
    this.height = height;
    this.margin = margin;
    this.data = data;

    this.axis = d3.axisLeft().ticks(10).tickFormat(d3.format("0"));
    this.scale = this.getScale(data);
  }

  getDomain = (data = []) => {
    let array = [];
    for (let d of data) {
      array = array.concat(d["y"]);
    }
    return d3.extent(array);
  };

  getScale = data => {
    const domain = this.getDomain(data);

    const scale = d3.scaleLinear(domain, [
      this.height - this.margin.bottom,
      this.margin.top
    ]);

    return scale;
  };

  componentDidMount() {
    const {label} = this.props;

    d3.select(".y")
      .call(this.axis.scale(this.scale))
      .append("text")
      .attr("fill", "#000")
      .attr("y", -(this.margin.left-5))
      .attr("transform", "rotate(-90)")
        .attr("x", -(this.margin.top+20))
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text(label);

    this.props.onAxisDidMount(this.scale.domain());
  }

  render() {
    return (
      <g className="y axis" transform={`translate(${this.margin.left},0)`} />
    );
  }
}

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
  label: PropTypes.string,
  onAxisDidMount: PropTypes.func
};

YAxis.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  showGrid: false,
  label: "",
  onAxisDidMount: () => {
    return null;
  }
};
