import { extent } from 'd3';
import { xyIntegral, xyReduce } from 'ml-spectra-processing';
import { useCallback, useMemo } from 'react';

import { Data1D, Datum1D } from '../../../data/data1d/Spectrum1D';
import { useChartData } from '../../context/ChartContext';
import { useScale } from '../../context/ScaleContext';

import { getIntegralYScale, getYScale, reScaleY } from './scale';

export default function useIntegralPath(
  integralOptions: { from: number; to: number },
  options:
    | {
        useConstantScale?: boolean;
        useActiveSpectrum?: false;
        spectrum: Datum1D;
      }
    | {
        useConstantScale?: boolean;
        useActiveSpectrum: true;
        spectrum?: Datum1D;
      },
) {
  const {
    useConstantScale = false,
    useActiveSpectrum = false,
    spectrum,
  } = options;
  const {
    xDomain,
    integralsYDomains,
    height,
    margin,
    verticalAlign,
    data,
    activeSpectrum,
  } = useChartData();

  const { scaleX } = useScale();

  const scaleY = useCallback(
    (ySeries: number[] = []) => {
      if (!useConstantScale) {
        return getIntegralYScale(
          { integralsYDomains, height, margin, verticalAlign },
          useActiveSpectrum ? activeSpectrum?.id : spectrum?.id,
        );
      } else {
        const yDomain = extent(ySeries) as number[];
        const scaledYDomain = reScaleY(0.5, {
          domain: yDomain,
          height,
          margin,
        });
        return getYScale({
          height,
          margin,
          verticalAlign,
          yDomain: scaledYDomain,
        });
      }
    },
    [
      useConstantScale,
      integralsYDomains,
      height,
      margin,
      verticalAlign,
      useActiveSpectrum,
      activeSpectrum?.id,
      spectrum?.id,
    ],
  );

  const integral = useMemo(() => {
    const { x, y } =
      useActiveSpectrum && activeSpectrum
        ? (data[activeSpectrum?.index].data as Data1D)
        : (spectrum?.data as Data1D);
    const { from, to } = integralOptions;
    return xyIntegral(
      { x, y },
      {
        from,
        to,
        reverse: true,
      },
    );
  }, [
    useActiveSpectrum,
    activeSpectrum,
    data,
    spectrum?.data,
    integralOptions,
  ]);

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
