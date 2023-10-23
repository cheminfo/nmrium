import { ScaleLinear } from 'd3';
import { xyReduce } from 'ml-spectra-processing';

import { getIntegralYScale } from '../1d/utilities/scale';
import { useChartData } from '../context/ChartContext';
import { PathBuilder } from '../utility/PathBuilder';

import { useXScale } from './useXScale';

function useIntegralYDomain(
  max: number,
  scaleRatio = 1,
): ScaleLinear<number, number, number> {
  const { height, margin } = useChartData();
  return getIntegralYScale({
    height,
    margin,
    yDomain: [0, max],
    scaleRatio,
  });
}

interface UseIntegralPathOptions {
  x: Float64Array;
  y: Float64Array;
  max: number;
  scaleRatio: number;
}

export default function useIntegralPath(options: UseIntegralPathOptions) {
  const { x, y, max, scaleRatio } = options;

  const scaleX = useXScale();
  const scaleY = useIntegralYDomain(max, scaleRatio);

  const xySeries = xyReduce(
    { x, y },
    {
      nbPoints: 200,
      optimize: true,
    },
  );

  const pathBuilder = new PathBuilder();
  pathBuilder.moveTo(scaleX(xySeries.x[0]), scaleY(xySeries.y[0]));
  for (let i = 1; i < xySeries.x.length; i++) {
    pathBuilder.lineTo(scaleX(xySeries.x[i]), scaleY(xySeries.y[i]));
  }

  return pathBuilder.toString();
}
