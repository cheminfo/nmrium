import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

class ZoomTool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
    };
    const { width, height, margin, data, domain, originDomain } = this.props;
    this.width = width;
    this.height = height;
    this.margin = margin;
    this.data = data;
    this.domain = domain;
    this.originDomain = originDomain;

    this.zoom = d3
      .zoom()
      .scaleExtent([-Infinity, Infinity])
      .translateExtent([
        [margin.left, margin.top],
        [this.width - this.margin.right, this.margin.left],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);
  }

  initZoomArea() {
    //
  }

  componentDidMount() {
    // this.initZoomArea();
    d3.select(this.refs.zoom).call(this.zoom);
  }

  zoomed = () => {
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    let t = d3.event.transform;
    const scale = d3.scaleLinear(this.originDomain.x, [
      this.margin.left,
      this.width - this.margin.right,
    ]);

    const _domain = t.rescaleX(scale).domain();
    this.props.onXAxisDomainUpdate(_domain);
  };

  componentDidUpdate(prevProps, prevState) {
    const {
      domain,
      originDomain,
      isActive,
      margin,
      width,
      height,
    } = this.props;
    this.domain = domain;
    this.originDomain = originDomain;
    this.width = width;
    this.height = height;

    this.zoom
      .scaleExtent([1, Infinity])
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    // this.initZoomArea();

    if (isActive) {
      this.zoom.on('zoom', this.zoomed);
    } else {
      this.zoom.on('zoom', null);
    }
  }

  render() {
    const { isActive, margin, width, height } = this.props;
    return (
      <g
        className={isActive ? 'zoom-container zoom ' : 'zoom-container'}
        onDoubleClick={this.reset}
        ref="zoom"
      >
        <rect
          width={`${width - margin.left - margin.right}`}
          height={`${height - margin.top - margin.bottom}`}
          transform={`translate(${margin.left},${margin.top})`}
        />
      </g>
    );
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
    left: PropTypes.number.isRequired,
  }),
  domain: PropTypes.array.isRequired,
  orign_domain: PropTypes.array.isRequired,
  onXAxisDomainUpdate: PropTypes.func,
  isActive: PropTypes.bool,
};

ZoomTool.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  domain: [],
  orign_domain: [],
  onXAxisDomainUpdate: () => {
    return [];
  },
  isActive: false,
};
