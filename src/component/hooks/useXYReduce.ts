import { DataXY, FromTo } from 'cheminfo-types';
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
): (data: { x: Float64Array; y: Float64Array }) => DataXY {
  const { width, xDomain, yDomain } = useChartData();

  return useCallback(
    (data: { x: Float64Array; y: Float64Array }) => {
      const { x, y } = data;
      const [from, to] =
        domainAxis === XYReducerDomainAxis.XAxis ? xDomain : yDomain;
      return xyReduce(
        { x, y },
        { from, to, nbPoints: width * 4, optimize: true, zones: getZones(x)},
      );
    },
    [domainAxis, width, xDomain, yDomain],
  );
}

function getZones(x: Float64Array): FromTo[] {
  const zones: FromTo[] = [];
  let from = x[0];
  const deltaX = x[1] - x[0];
  const deltaTol = deltaX * 0.005; // Accept deltas having this discrepancy as equal
  let i = 1;
  for(; i < x.length; i++) {
    if(Math.abs(x[i + 1] - x[i] - deltaX) > deltaTol) {
      zones.push({from, to: x[i]})
      from = x[i + 1];
      i++;
    } 
  }
  zones.push({from, to: x[i - 1]});

  if(zones.length >= x.length/10) {
    // There are too many zones compared with the original x
    return [];
  }

  return zones;
}
