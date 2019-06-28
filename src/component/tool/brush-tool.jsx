import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

class BrushTool extends Component {
  constructor(props) {
    super(props);
    const { width, height, margin, data, domain } = this.props;
    this.width = width;
    this.height = height;
    this.margin = margin;
    this.data = data;
    this.domain = domain;
    this.orign_domain = domain;

    this.brush = d3
      .brushX()
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);
  }

  componentDidMount() {
    d3.select(this.refs.brush).call(this.brush);
  }

  brushEnd = () => {
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

    if (!d3.event.selection) {
      return;
    }
    const [x1, x2] = d3.event.selection;
    const scale = d3.scaleLinear(this.domain, [
      this.margin.left,
      this.width - this.margin.right,
    ]);

    const range = [scale.invert(x1), scale.invert(x2)];
    d3.select('.brush').call(this.brush.move, null); // This remove the grey brush area as soon as the selection has been done

    this.props.onDomainUpdate(range);
  };

  reset = (e) => {
    this.props.onDomainUpdate(this.orign_domain);
  };

  componentDidUpdate(prevProps, prevState) {
    const { domain, orignXDomain, isActive } = this.props;
    this.domain = domain;
    this.orign_domain = orignXDomain;

    if (isActive) {
      this.brush.on('end', this.brushEnd);
    } else {
      this.brush.on('end', null);
    }
  }

  render() {
    const { isActive } = this.props;

    return (
      <g
        className={isActive ? 'brush-conatiner brush ' : 'brush-conatiner'}
        onDoubleClick={this.reset}
        ref="brush"
      />
    );
  }
}

export default BrushTool;

BrushTool.propTypes = {
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
  showGrid: PropTypes.bool,
  onDomainUpdate: PropTypes.func,
};

BrushTool.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  domain: [],
  orign_domain: [],
  showGrid: false,
  onDomainUpdate: () => {
    return [];
  },
};
