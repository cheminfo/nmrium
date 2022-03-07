import { ScaleLinear } from 'd3';
import { xyIntegral, xyReduce } from 'ml-spectra-processing';
import { useMemo } from 'react';

import { Data1D } from '../../data/types/data1d';
import { getIntegralYScale } from '../1d/utilities/scale';
import { useChartData } from '../context/ChartContext';
import { PathBuilder } from '../utility/PathBuilder';

import { useXScale } from './useXScale';

function useIntegralYDomain(): ScaleLinear<number, number, number> {
  const { height, margin, verticalAlign, activeSpectrum, integralsYDomains } =
    useChartData();

  return useMemo(
    () =>
      getIntegralYScale({
        height,
        margin,
        verticalAlign,
        activeSpectrum,
        integralsYDomains,
      }),
    [activeSpectrum, height, integralsYDomains, margin, verticalAlign],
  );
}

export default function useIntegralPath(integralOptions: {
  from: number;
  to: number;
}) {
  const { data, activeSpectrum } = useChartData();

  const scaleX = useXScale();
  const scaleY = useIntegralYDomain();
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
    if (integral) {
      const xySeries = xyReduce(integral, {
        // from: xDomain[0],
        // to: xDomain[1],
        nbPoints: 200,
        optimize: true,
      });

      const pathBuilder = new PathBuilder();
      pathBuilder.moveTo(scaleX(xySeries.x[0]), scaleY(xySeries.y[0]));
      for (let i = 1; i < xySeries.x.length; i++) {
        pathBuilder.lineTo(scaleX(xySeries.x[i]), scaleY(xySeries.y[i]));
      }

      return pathBuilder.toString();
    } else {
      return '';
    }
  }, [integral, scaleX, scaleY]);

  return paths;
}
