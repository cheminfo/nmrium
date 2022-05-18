import { DataXY, DoubleArray } from 'cheminfo-types';
import { xyReduce } from 'ml-spectra-processing';
import { useCallback } from 'react';

import { useChartData } from '../context/ChartContext';

export enum XYReducerDomainAxis {
  XAxis = 'XAxis',
  YAxis = 'YAxis',
}

type XYReducerDomainAxisType = keyof typeof XYReducerDomainAxis;

export default function useXYReduce(
  domainAxis: XYReducerDomainAxisType,
): (data: { x: Float64Array; y: Float64Array }) => DataXY<DoubleArray> {
  const { width, xDomain, yDomain } = useChartData();

  return useCallback(
    (data: { x: Float64Array; y: Float64Array }) => {
      const { x, y } = data;
      const [from, to] =
        domainAxis === XYReducerDomainAxis.XAxis ? xDomain : yDomain;
      return xyReduce(
        { x, y },
        { from, to, nbPoints: width * 4, optimize: true },
      );
    },
    [domainAxis, width, xDomain, yDomain],
  );
}
