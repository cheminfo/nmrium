import React, { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

export default class XAxis extends Component {
  constructor(props) {
    super(props);

    const { width, height, margin, data } = this.props;
    this.width = width;
    this.height = height;
    this.margin = margin;
    this.data = data;

    this.xAxis = d3.axisBottom().ticks(10).tickFormat(d3.format("0"));

    this.grid = d3
      .axisBottom()
      .ticks(20)
      .tickSize(-(height - margin.top - margin.bottom))
      .tickFormat("");

    this.scale = this.getScale(data);
  }

  getDomain = (data = []) => {
    let array = [];

    for (let d of data) {
      array = array.concat(d["x"]);
    }
    return d3.extent(array);
  };

  getScale = data => {
    const domain = this.getDomain(data);
    const scale = d3.scaleLinear(domain, [
      this.margin.left,
      this.width - this.margin.right
    ]);

    return scale;
  };

  componentDidMount() {
    const { label } = this.props;
    //drwa x axis
    d3.select(this.refs.xAxis)
      .call(this.xAxis.scale(this.scale))
      .append("text")
      .attr("fill", "black")
      .attr("y", 20)
      .attr("x", this.width -60)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text(label);
    //drwa grid at x axis
    d3.select(this.refs.grid).call(this.grid.scale(this.scale));

    this.props.onAxisDidMount(this.scale.domain());
  }

  componentDidUpdate(prevProps, prevState) {
    const { domain } = this.props;
    if (domain && domain.length > 0)
      d3.select(".x")
        .transition()
        .duration(500)
        .call(this.xAxis.scale(this.scale.domain(domain)));
  }

  render() {
    const { showGrid } = this.props;

    return (
      <React.Fragment>
        <g
          className="x axis"
          transform={`translate(0,${this.height - this.margin.bottom})`}
          ref="xAxis"
          //   ref={xAxis => {
          //     this.props.ref(xAxis);
          //   }}
        />
        {showGrid ? (
          <g
            className="grid"
            ref="grid"
            transform={`translate(0,${this.height - this.margin.bottom})`}
          />
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}

XAxis.propTypes = {
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

XAxis.defaultProps = {
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
