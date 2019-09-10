import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
// import PropTypes from 'prop-types';
import { event as currentEvent } from 'd3-selection';

import { useDispatch } from '../context/DispatchContext';
import {
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_ZOOM_FACTOR,
} from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import { useDimension } from '../context/DimensionsContext';

const BrushTool = ({ isActive }) => {
  const { width, height, margin } = useDimension();
  const { getScale, mode, originDomain } = useChartData();

  const refBrush = useRef();
  const dispatch = useDispatch();

  const brush = d3
    .brushX()
    .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

  const zoom = d3
    .zoom()
    .scaleExtent([-Infinity, Infinity])
    .translateExtent([[0, 0], [width - margin.right, height - margin.bottom]])
    .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

  const brushEnd = useCallback(() => {
    // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    if (!currentEvent.selection) {
      return;
    }

    const [x1, x2] = currentEvent.selection;
    // const scale = d3.scaleLinear(this.domain.x, [
    //   this.width - this.margin.right,
    //   this.margin.left
    // ]);
    const scale = getScale().x;

    const range =
      mode === 'RTL'
        ? [scale.invert(x2), scale.invert(x1)]
        : [scale.invert(x1), scale.invert(x2)];
    d3.select(refBrush.current).call(brush.move, null); // This remove the grey brush area as soon as the selection has been done

    dispatch({ type: SET_X_DOMAIN, xDomain: range });
  }, [brush, getScale, mode, dispatch]);

  const zoomed = useCallback(() => {
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

    const yDomain = t.rescaleY(scale).domain();
    dispatch({ type: SET_Y_DOMAIN, yDomain: yDomain });
    dispatch({ type: SET_ZOOM_FACTOR, zoomFactor: t });
  }, [dispatch, height, margin.bottom, margin.top, originDomain]);

  const reset = useCallback(() => {
    dispatch({ type: SET_X_DOMAIN, xDomain: originDomain.x });
    dispatch({ type: SET_Y_DOMAIN, yDomain: originDomain.y });
  }, [dispatch, originDomain]);

  useEffect(() => {
    brush.extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ]);
    zoom
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    d3.select(refBrush.current)
      .selectAll('*')
      .remove();

    if (isActive) {
      d3.select(refBrush.current)
        .call(brush)
        .call(zoom, d3.zoomIdentity)
        .on('dblclick.zoom', null);
      brush.on('end', brushEnd);
      zoom.on('zoom', zoomed);
    } else {
      brush.on('end', null);
      zoom.on('zoom', null);
    }
  }, [brush, brushEnd, height, isActive, margin, width, zoom, zoomed]);

  return (
    <g
      className={isActive ? 'brush-container brush ' : ' brush-container'}
      onDoubleClick={reset}
      ref={refBrush}
    />
  );
};

// function isEqual(prevProps, nextProps) {
//   if (JSON.stringify(prevProps).trim() === JSON.stringify(nextProps).trim()) {
//     return true;
//   }

//   return false;
// }

export default BrushTool;

// BrushTool.propTypes = {
//   width: PropTypes.number.isRequired,
//   height: PropTypes.number.isRequired,
//   margin: PropTypes.shape({
//     top: PropTypes.number.isRequired,
//     right: PropTypes.number.isRequired,
//     bottom: PropTypes.number.isRequired,
//     left: PropTypes.number.isRequired,
//   }),
//   // domain: PropTypes.object.isRequired,
//   // originDomain: PropTypes.object.isRequired,
//   // getScale: PropTypes.func.isRequired,
// };
