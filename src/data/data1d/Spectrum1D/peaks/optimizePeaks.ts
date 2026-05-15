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

 let newPeaks = xyPeaksOptimization({ x, y: re }, peaks, {
    frequency,
    groupingFactor: 3,
    optimization: { kind: 'lm', options: { maxIterations: 20 } },
    parameters: {
      fwhm: { 
        optimize: true, 
        min: (peak) => (peak.shape?.fwhm ?? 0) / 3,
        max: (peak) => (peak.shape?.fwhm ?? 0) * 3,
       },
      mu: { optimize: false },
      x: { optimize: false },
      y: {
        optimize: true,
        min: 0, 
        init: (peak) => peak.y * 0.8, 
       },
    }
  });

  newPeaks = xyPeaksOptimization({ x, y: re }, newPeaks, {
    frequency,
    groupingFactor: 3,
    optimization: { kind: 'lm', options: { maxIterations: 20, } },
    parameters: {
      fwhm: { 
        optimize: true, 
        min: (peak) => (peak.shape?.fwhm ?? 0) / 3,
        max: (peak) => (peak.shape?.fwhm ?? 0) * 3,
       },
      mu: { optimize: true },
      x: { optimize: false },
      y: {
        optimize: true, 
        min: 0,
       },
    }
  });


  newPeaks = xyPeaksOptimization({ x, y: re }, newPeaks, {
    frequency,
    groupingFactor: 4,
    optimization: { kind: 'lm', options: { maxIterations: 20, } },
    parameters: {
      fwhm: {
        optimize: true, 
        min: (peak) => (peak.shape?.fwhm ?? 0) / 2, 
        max: (peak) => (peak.shape?.fwhm ?? 0) * 2, 
      },
      mu: {
        optimize: false, 
      },
      x: { optimize: true }, 
      y: { optimize: true, 
        min: 0,
      },
    }
  });

  newPeaks = xyPeaksOptimization({ x, y: re }, newPeaks, {
    frequency,
    groupingFactor: 3,
    optimization: { kind: 'lm', options: { maxIterations: 10 } },
    parameters: {
      fwhm: {
        optimize: true, 
        min: (peak) => (peak.shape?.fwhm ?? 0) / 2, 
        max: (peak) => (peak.shape?.fwhm ?? 0) * 2, 
      },
      mu: {
        optimize: true, 
      },
      x: { optimize: true }, 
      y: { optimize: true, 
        min: 0,
      },
    }
  });

  return mapPeaks(spectrum.peaks.values.concat(newPeaks), spectrum, {
    checkIsExisting: false,
  });
}
