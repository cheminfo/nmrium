import { PeakXYWidth } from 'cheminfo-types';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { xyPeaksOptimization } from 'nmr-processing';

import { Datum1D, Peak } from '../../../types/data1d';

import { mapPeaks } from './mapPeaks';

interface OptimizePeaksOptions {
  from: number;
  to: number;
  peaks: Peak[];
}

export function optimizePeaks(datum1D: Datum1D, options: OptimizePeaksOptions) {
  const { from, to, peaks } = options;
  let { re, x } = datum1D.data;

  const fromIndex = xFindClosestIndex(datum1D.data.x, from);
  const ToIndex = xFindClosestIndex(datum1D.data.x, to);

  // cerate deleted peaks objet where the key is the id of the peaks that we need to remove
  const ids = {};
  for (const peak of peaks) {
    ids[peak.id] = peak;
  }
  //remove peaks before start the optimization from the original list
  datum1D.peaks.values = datum1D.peaks.values.filter((peak) => !ids[peak.id]);

  x = x.subarray(fromIndex, ToIndex);
  re = re.subarray(fromIndex, ToIndex);

  const newPeaks = xyPeaksOptimization(
    { x, y: re },
    peaks as PeakXYWidth[],
    {},
  );

  return mapPeaks(
    datum1D.peaks.values.concat(newPeaks as Peak[]),
    datum1D,
    false,
  );
}
