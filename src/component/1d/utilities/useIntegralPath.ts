import { extent } from 'd3';
import { xyIntegral, xyReduce } from 'ml-spectra-processing';
import { useCallback, useMemo } from 'react';

import { Data1D } from '../../../data/data1d/Spectrum1D';
import { useChartData } from '../../context/ChartContext';
import { useScale } from '../../context/ScaleContext';

import { getYScale, reScaleY } from './scale';

export default function useIntegralPath(integralOptions: {
  from: number;
  to: number;
}) {
  const { xDomain, height, margin, verticalAlign, data, activeSpectrum, zoom } =
    useChartData();

  const { scaleX } = useScale();

  const scaleY = useCallback(
    (ySeries: number[] = []) => {
      const yDomain = extent(ySeries) as number[];
      const scale = zoom.integral.scales[activeSpectrum?.id || ''];
      const scaledYDomain = reScaleY(
        scale === undefined ? 0.3 : scale < 0.1 ? 0.05 : scale,
        {
          domain: yDomain,
          height,
          margin,
        },
      );
      return getYScale({
        height,
        margin,
        verticalAlign,
        yDomain: scaledYDomain,
      });
    },
    [activeSpectrum, height, margin, verticalAlign, zoom.integral.scales],
  );

  const integral = useMemo(() => {
    if (activeSpectrum) {
      const { x, y } = data[activeSpectrum?.index].data as Data1D;
      const { from, to } = integralOptions;
      return xyIntegral(
        { x, y },
        {
          from,
          to,
          reverse: true,
        },
      );
    }
    return { x: [], y: [] };
  }, [activeSpectrum, data, integralOptions]);

  const path = useMemo(() => {
    if (integral && scaleX) {
      const xySeries = xyReduce(integral, {
        from: xDomain[0],
        to: xDomain[1],
        nbPoints: 200,
        optimize: true,
      });

      let path = `M ${scaleX()(xySeries.x[0])} ${scaleY(xySeries.y)(
        xySeries.y[0],
      )}`;
      path += xySeries.x.slice(1).reduce((accumulator, point, i) => {
        accumulator += ` L ${scaleX()(point)} ${scaleY(xySeries.y)(
          xySeries.y[i + 1],
        )}`;
        return accumulator;
      }, '');

      return path;
    } else {
      return '';
    }
  }, [integral, scaleX, scaleY, xDomain]);

  return path;
}
