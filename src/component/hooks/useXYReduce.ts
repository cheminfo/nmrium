import type { DataXY } from 'cheminfo-types';
import { xyReduce } from 'ml-spectra-processing';
import { useCallback } from 'react';

import { useChartData } from '../context/ChartContext.js';

type XYReducerDomainAxis = 'XAxis' | 'YAxis';

export default function useXYReduce(
  domainAxis: XYReducerDomainAxis,
): (data: { x: Float64Array; y: Float64Array }) => DataXY {
  const { width, xDomain, yDomain } = useChartData();

  return useCallback(
    (data: { x: Float64Array; y: Float64Array }) => {
      const { x, y } = data;
      const [from, to] = domainAxis === 'XAxis' ? xDomain : yDomain;
      return xyReduce(
        { x, y },
        { from, to, nbPoints: width * 4, optimize: true },
      );
    },
    [domainAxis, width, xDomain, yDomain],
  );
}
