import type { Peak1D } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { mapPeaks, xyPeaksOptimization } from 'nmr-processing';

interface OptimizePeaksOptions {
  from: number;
  to: number;
  peaks: Peak1D[];
}

export function optimizePeaks(
  spectrum: Spectrum1D,
  options: OptimizePeaksOptions,
) {
  const { from, to, peaks } = options;
  const { originFrequency: frequency } = spectrum.info;
  let { re, x } = spectrum.data;

  const fromIndex = xFindClosestIndex(x, from);
  const ToIndex = xFindClosestIndex(x, to);

  // create deleted peaks object where the key is the id of the peaks that we need to remove
  const ids: Record<string, Peak1D> = {};
  for (const peak of peaks) {
    ids[peak.id] = peak;
  }
  //remove peaks before start the optimization from the original list
  spectrum.peaks.values = spectrum.peaks.values.filter((peak) => !ids[peak.id]);

  x = x.subarray(fromIndex, ToIndex);
  re = re.subarray(fromIndex, ToIndex);

  const newPeaks = xyPeaksOptimization({ x, y: re }, peaks, {
    frequency,
    groupingFactor: 3,
  });
  return mapPeaks(
    spectrum.peaks.values.concat(newPeaks as Peak1D[]),
    spectrum,
    {
      checkIsExisting: false,
    },
  );
}
