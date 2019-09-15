import React, { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../css/integral-tool.css';
import { XY } from 'ml-spectra-processing';

import { useDispatch } from '../context/DispatchContext';
import { ADD_INTEGRAL } from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import { useDimension } from '../context/DimensionsContext';

const IntegralTool = () => {
  const { width, height, margin } = useDimension();
  const { getScale, mode, data, activeSpectrum, isActive } = useChartData();

  const refBrush = useRef();
  const dispatch = useDispatch();

  const brush = d3
    .brushX()
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

  useEffect(() => {
    brush.extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ]);

    d3.select(refBrush.current)
      .selectAll('*')
      .remove();

    d3.select(refBrush.current).call(brush);
    brush.on('end', brushEnd);
  });

  return (
    <g
      className={isActive ? 'integral-container brush ' : 'integral-container'}
      ref={refBrush}
    />
  );
};

export default IntegralTool;
