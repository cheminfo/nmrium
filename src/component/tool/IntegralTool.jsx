import React, { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../css/integral-tool.css';
import { XY } from 'ml-spectra-processing';

import { useDispatch } from '../context/DispatchContext';
import { ADD_INTEGRAL, SET_INTEGRAL_Y_DOMAIN } from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';

const IntegralTool = () => {
  const {
    getScale,
    mode,
    data,
    activeSpectrum,
    isActive,
    width,
    height,
    margin,
    originDomain,
  } = useChartData();

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
    if (activeSpectrum) {
      if (!d3.event.selection) {
        return;
      }

      const [x1, x2] = d3.event.selection;

      const scale = getScale().x;

      const range =
        mode === 'RTL'
          ? [scale.invert(x2), scale.invert(x1)]
          : [scale.invert(x1), scale.invert(x2)];

      const _data = data.find((d) => d.id === activeSpectrum.id);

      const integralResult = XY.integral(_data, {
        from: range[0],
        to: range[1],
        reverse: true,
      });

      const integralValue = XY.integration(_data, {
        from: range[0],
        to: range[1],
        reverse: true,
      });

      d3.select(refBrush.current).call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      const integral = {
        id: activeSpectrum.id,
        from: range[0],
        to: range[1],
        ...integralResult,
        value: integralValue,
      };
      dispatch({
        type: ADD_INTEGRAL,
        integral,
      });
    }
  }, [activeSpectrum, brush.move, data, dispatch, getScale, mode]);

  const zoomed = useCallback(() => {
    const scale = d3.scaleLinear(originDomain.y, [
      height - margin.bottom,
      margin.top,
    ]);

    const t = d3.zoomIdentity
      .translate(0, height - margin.bottom)
      .scale(d3.event.transform.k)
      .translate(0, -(height - margin.bottom));

    const yDomain = t.rescaleY(scale).domain();
    dispatch({ type: SET_INTEGRAL_Y_DOMAIN, yDomain: yDomain });
  }, [dispatch, height, margin.bottom, margin.top, originDomain]);

  useEffect(() => {
    d3.select(refBrush.current)
      .call(brush)
      .call(zoom, d3.zoomIdentity)
      .on('dblclick.zoom', null);
    brush.on('end', brushEnd);
    zoom.on('zoom', zoomed);
  }, [brush, brushEnd, zoom, zoomed]);

  return (
    <g
      className={isActive ? 'integral-container brush ' : 'integral-container'}
      ref={refBrush}
    />
  );
};

export default IntegralTool;
