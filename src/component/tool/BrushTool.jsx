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

const BrushTool = ({ isActive }) => {
  const {
    getScale,
    mode,
    originDomain,
    data,
    width,
    height,
    margin,
  } = useChartData();

  const refBrush = useRef();
  const dispatch = useDispatch();

  const getClosestNumber = (array = [], goal = 0) => {
    const closest = array.reduce((prev, curr) => {
      return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
    });
    return closest;
  };

  const brush = d3
    .brushX()
    .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

  const zoom = d3
    .zoom()
    .scaleExtent([-Infinity, Infinity])
    .translateExtent([[0, 0], [width - margin.right, height - margin.bottom]])
    .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

  const brushEnd = useCallback(() => {
    console.log('brushend');
    if (!currentEvent.selection) {
      return;
    }
    const [x1, x2] = currentEvent.selection;
    const scale = getScale().x;

    const range =
      mode === 'RTL'
        ? [scale.invert(x2), scale.invert(x1)]
        : [scale.invert(x1), scale.invert(x2)];
    d3.select(refBrush.current).call(brush.move, null); // This remove the grey brush area as soon as the selection has been done

    dispatch({ type: SET_X_DOMAIN, xDomain: range });
  }, [brush, getScale, mode, dispatch]);

  const zoomed = useCallback(() => {
    console.log('zoomed');
    const scale = d3.scaleLinear(originDomain.y, [
      height - margin.bottom,
      margin.top,
    ]);
    let t;
    if (data.length === 1) {
      const closest = getClosestNumber(data[0].y);
      const referencePoint = getScale().y(closest);
      t = d3.zoomIdentity
        .translate(0, referencePoint)
        .scale(currentEvent.transform.k)
        .translate(0, -referencePoint);
    } else {
      t = d3.zoomIdentity
        .translate(0, height - margin.bottom)
        .scale(currentEvent.transform.k)
        .translate(0, -(height - margin.bottom));
    }

    const yDomain = t.rescaleY(scale).domain();
    dispatch({ type: SET_Y_DOMAIN, yDomain: yDomain });
    dispatch({ type: SET_ZOOM_FACTOR, zoomFactor: t });
  }, [
    dispatch,
    height,
    margin.bottom,
    margin.top,
    originDomain,
    getScale,
    data,
  ]);

  const reset = useCallback(() => {
    dispatch({ type: SET_X_DOMAIN, xDomain: originDomain.x });
    dispatch({ type: SET_Y_DOMAIN, yDomain: originDomain.y });
  }, [dispatch, originDomain]);

  useEffect(() => {
    // brush.extent([
    //   [margin.left, margin.top],
    //   [width - margin.right, height - margin.bottom],
    // ]);
    // zoom
    //   .translateExtent([
    //     [margin.left, margin.top],
    //     [width - margin.right, height - margin.bottom],
    //   ])
    //   .extent([
    //     [margin.left, margin.top],
    //     [width - margin.right, height - margin.bottom],
    //   ]);

    // d3.select(refBrush.current)
    //   .selectAll('*')
    //   .remove();

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

export default BrushTool;
