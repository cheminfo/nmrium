import React, { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

class ZoomTool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false
    };
    const { width, height, margin, data, domain } = this.props;
    this.width = width;
    this.height = height;
    this.margin = margin;
    this.data = data;
    this.domain = domain;
    this.orign_domain = domain;

    this.zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom]
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom]
      ]);
  }

  componentDidMount() {
    d3.select(this.refs.zoom)
      .append("rect")
      .attr("width", this.width - this.margin.right - this.margin.left)
      .attr("height", this.height - this.margin.bottom - this.margin.top)
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      )
      .call(this.zoom);
  }

  zoomed = () => {
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    let t = d3.event.transform;
    const scale = d3.scaleLinear(this.orign_domain, [
      this.margin.left,
      this.width - this.margin.right
    ]);

    const domain = t.rescaleX(scale).domain();
    this.props.onDomainUpdate(domain);
  };

  componentDidUpdate(prevProps, prevState) {
    const { domain, orignXDomain, isActive } = this.props;
    this.domain = domain;
    this.orign_domain = orignXDomain;

    if (isActive) {
      this.zoom.on("zoom", this.zoomed);
    } else {
      this.zoom.on("zoom", null);
    }
  }



  render() {
    const {isActive}  = this.props;
    return <g className={(isActive)?'zoom-container zoom ':'zoom-container'}onDoubleClick={this.reset}  ref="zoom" />;
  }
}

export default ZoomTool;

ZoomTool.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired
  }),
  domain: PropTypes.array.isRequired,
  orign_domain: PropTypes.array.isRequired,
  onDomainUpdate: PropTypes.func,
  isActive: PropTypes.bool
};

ZoomTool.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  domain: [],
  orign_domain: [],
  onDomainUpdate: () => {
    return [];
  },
  isActive: false
};
