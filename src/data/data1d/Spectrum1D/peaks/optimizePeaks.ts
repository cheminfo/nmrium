import { PeakXYWidth } from 'cheminfo-types';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { xyPeaksOptimization } from 'nmr-processing';

import { Datum1D, Peak } from '../../../types/data1d';

import { mapPeaks } from './mapPeaks';

interface OptimizePeaksOptions {
  from: number;
  to: number;
}

export function optimizePeaks(datum1D: Datum1D, options: OptimizePeaksOptions) {
  const { from, to } = options;
  let { re, x } = datum1D.data;

  if (from !== undefined && to !== undefined) {
    const fromIndex = xFindClosestIndex(datum1D.data.x, from);
    const ToIndex = xFindClosestIndex(datum1D.data.x, to);

    x = x.slice(fromIndex, ToIndex);
    re = re.slice(fromIndex, ToIndex);
  }
  const peaks = datum1D.peaks.values as PeakXYWidth[];
  const newPeaks = xyPeaksOptimization({ x, y: re }, peaks, {});

  return mapPeaks(newPeaks as Peak[], datum1D);
}
