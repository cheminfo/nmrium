import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

import { event as currentEvent } from 'd3-selection';

import { dispatchContext } from '../context/DispatchContext';
import {
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_ZOOM_FACTOR,
} from '../reducer/Actions';

class BrushTool extends Component {
  constructor(props) {
    super(props);
    const { width, height, margin } = this.props;

    this.brush = d3
      .brushX()
      .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

    this.zoom = d3
      .zoom()
      .scaleExtent([-Infinity, Infinity])
      .translateExtent([[0, 0], [width - margin.right, height - margin.bottom]])
      .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

    this.zoomed = this.zoomed.bind(this);
  }

  componentDidMount() {
    const { isActive, width, height, margin } = this.props;

    this.brush.extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ]);
    this.zoom = d3
      .zoom()
      .scaleExtent([-Infinity, Infinity])
      .translateExtent([[0, 0], [width - margin.right, height - margin.bottom]])
      .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

    this.zoom
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    d3.select(this.refBrush)
      .selectAll('*')
      .remove();

    if (isActive) {
      d3.select(this.refBrush)
        .call(this.brush)
        .call(this.zoom, d3.zoomIdentity)
        .on('dblclick.zoom', null);
      this.brush.on('end', this.brushEnd);
      this.zoom.on('zoom', this.zoomed);
    } else {
      this.brush.on('end', null);
      this.zoom.on('zoom', null);
    }
  }

  componentDidUpdate() {
    const { isActive, width, height, margin } = this.props;

    this.brush.extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ]);
    this.zoom = d3
      .zoom()
      .scaleExtent([-Infinity, Infinity])
      .translateExtent([[0, 0], [width - margin.right, height - margin.bottom]])
      .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

    this.zoom
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    d3.select(this.refBrush)
      .selectAll('*')
      .remove();

    if (isActive) {
      d3.select(this.refBrush)
        .call(this.brush)
        .call(this.zoom, d3.zoomIdentity)
        .on('dblclick.zoom', null);
      this.brush.on('end', this.brushEnd);
      this.zoom.on('zoom', this.zoomed);
    } else {
      this.brush.on('end', null);
      this.zoom.on('zoom', null);
    }
  }

  brushEnd = () => {
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

    if (!currentEvent.selection) {
      return;
    }

    const [x1, x2] = currentEvent.selection;
    // const scale = d3.scaleLinear(this.domain.x, [
    //   this.width - this.margin.right,
    //   this.margin.left
    // ]);
    const { getScale, mode } = this.props;
    const scale = getScale().x;

    const range =
      mode === 'RTL'
        ? [scale.invert(x2), scale.invert(x1)]
        : [scale.invert(x1), scale.invert(x2)];
    d3.select(this.refBrush).call(this.brush.move, null); // This remove the grey brush area as soon as the selection has been done

    const dispatch = this.context;
    //  console.log(useContext(dispatchContext))
    dispatch({ type: SET_X_DOMAIN, xDomain: range });
    // dispatchContext({ type: SET_X_DOMAIN, xDomain:range });
    // this.props.onXAxisDomainUpdate(range);
  };

  zoomed() {
    const { height, margin, originDomain } = this.props;
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    // let t = currentEvent.transform;
    // let t = d3.zoomIdentity.translate(0,height/2).scale(currentEvent.transform.k).translate(0,-d3.select('.line').node().getBBox().height);
    let t = d3.zoomIdentity
      .translate(0, height - margin.bottom)
      .scale(currentEvent.transform.k)
      .translate(0, -(height - margin.bottom));

    const scale = d3.scaleLinear(originDomain.y, [
      height - margin.bottom,
      margin.top,
    ]);

    const ydomain = t.rescaleY(scale).domain();
    const dispatch = this.context;
    dispatch({ type: SET_Y_DOMAIN, yDomain: ydomain });
    dispatch({ type: SET_ZOOM_FACTOR, zoomFactor: t });
  }

  reset = () => {
    const { originDomain } = this.props;
    const dispatch = this.context;
    dispatch({ type: SET_X_DOMAIN, xDomain: originDomain.x });
    dispatch({ type: SET_Y_DOMAIN, yDomain: originDomain.y });
  };

  render() {
    const { isActive } = this.props;

    return (
      <g
        className={isActive ? 'brush-container brush ' : ' brush-container'}
        onDoubleClick={this.reset}
        ref={(ref) => (this.refBrush = ref)}
      />
    );
  }
}
BrushTool.contextType = dispatchContext;

function isEqual(prevProps, nextProps) {
  if (JSON.stringify(prevProps).trim() === JSON.stringify(nextProps).trim()) {
    return true;
  }

  return false;
}

export default React.memo(BrushTool, isEqual);

BrushTool.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  // domain: PropTypes.object.isRequired,
  originDomain: PropTypes.object.isRequired,
  getScale: PropTypes.func.isRequired,
};

// BrushTool.defaultProps = {
//   onXAxisDomainUpdate: () => {
//     return [];
//   },
//   onYAxisDomainUpdate: () => {
//     return [];
//   },
//   onDomainReset: () => {
//     return [];
//   },
// };
