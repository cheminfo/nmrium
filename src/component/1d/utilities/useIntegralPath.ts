import { path } from 'd3';
import { xyIntegral, xyReduce } from 'ml-spectra-processing';
import { useMemo } from 'react';

import { Data1D } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useScale } from '../../context/ScaleContext';

import { getYScale, reScaleY } from './scale';

export default function useIntegralPath(integralOptions: {
  from: number;
  to: number;
}) {
  const {
    xDomain,
    height,
    yDomain,
    margin,
    verticalAlign,
    data,
    activeSpectrum,
    zoom,
  } = useChartData();

  const { scaleX } = useScale();

  const scaleY = useMemo(() => {
    const scale = zoom.integral.scales[activeSpectrum?.id || ''];
    const scaledYDomain = reScaleY(
      scale === undefined ? 1 : scale < 0.1 ? 0.05 : scale,
      {
        domain: [yDomain[0], yDomain[1] / 20],
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
  }, [
    activeSpectrum?.id,
    height,
    margin,
    verticalAlign,
    yDomain,
    zoom.integral.scales,
  ]);

  const integral = useMemo(() => {
    if (activeSpectrum) {
      const { x, re } = data[activeSpectrum?.index].data as Data1D;
      const { from, to } = integralOptions;
      return xyIntegral(
        { x, y: re },
        {
          from,
          to,
          reverse: true,
        },
      );
    }
    return { x: [], y: [] };
  }, [activeSpectrum, data, integralOptions]);

  const paths = useMemo(() => {
    if (integral && scaleX) {
      const xySeries = xyReduce(integral as any, {
        from: xDomain[0],
        to: xDomain[1],
        nbPoints: 200,
        optimize: true,
      });

      const pathBuilder = path();

      pathBuilder.moveTo(scaleX()(xySeries.x[0]), scaleY(xySeries.y[0]));
      for (let i = 1; i < xySeries.x.length; i++) {
        pathBuilder.lineTo(scaleX()(xySeries.x[i]), scaleY(xySeries.y[i + 1]));
      }

      return pathBuilder.toString();
    } else {
      return '';
    }
  }, [integral, scaleX, scaleY, xDomain]);

  return paths;
}
