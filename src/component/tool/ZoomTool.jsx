import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { dispatchContext } from '../context/DispatchContext';
import { SET_X_DOMAIN, SET_Y_DOMAIN } from '../reducer/Actions';

class ZoomTool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
    };
    const { width, height, margin } = this.props;

    this.zoom = d3
      .zoom()
      .scaleExtent([-Infinity, Infinity])
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, margin.left],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);
  }

  componentDidMount() {
    d3.select(this.refs.zoom).call(this.zoom);
  }

  zoomed = () => {
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    let t = d3.event.transform;
    const { width, margin, originDomain,domain } = this.props;

    const scale = d3.scaleLinear(originDomain.x, [
      width - margin.right,
      margin.left,
    ]);

    const _domain = t.rescaleX(scale).domain();
    const dispatch = this.context;
    dispatch({ type: SET_Y_DOMAIN, yDomain: [domain.y[0], _domain[1]] });

    // this.props.onXAxisDomainUpdate(_domain);
  };

  componentDidUpdate(prevProps, prevState) {
    const { isActive, margin, width, height } = this.props;

    this.zoom
      .scaleExtent([-Infinity, Infinity])
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

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
ZoomTool.contextType = dispatchContext;

export default ZoomTool;

ZoomTool.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.object.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  domain: PropTypes.object.isRequired,
  onXAxisDomainUpdate: PropTypes.func,
  isActive: PropTypes.bool,
};

ZoomTool.defaultProps = {
  onXAxisDomainUpdate: () => {
    return [];
  },
  isActive: false,
};
