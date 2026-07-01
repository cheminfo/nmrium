import type { Peak1D } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { mapPeaks, xyPeaksOptimizationByStages } from 'nmr-processing';

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

  const newPeaks = xyPeaksOptimizationByStages({ x, y: re }, peaks, {
    frequency,
    groupingFactor: 10,
    stages: [
      {
        // Stage 1: local stabilization
    factorLimits: 2,
    maxNumberOfPeaks: 40,
    optimization: {
      kind: 'lm',
      options: { maxIterations: 20, errorTolerance: 1e-3 },
    },
    parameters: {
      fwhm: {
        optimize: true,
        min: (peak: any) => (peak.shape?.fwhm ?? 0) * 0.5,
        max: (peak: any) => (peak.shape?.fwhm ?? 0) * 2,
      },
      mu: { optimize: false },
      x: { optimize: false },
      y: {
        optimize: true,
        init: (peak: any) => peak.y
      },
    },
  },
  {
    factorLimits: 2,
    maxNumberOfPeaks: 40,
    optimization: {
      kind: 'lm',
      options: { maxIterations: 20, errorTolerance: 1e-3 },
    },
    parameters: {
      fwhm: {
        optimize: true,
        min: (peak: any) => (peak.shape?.fwhm ?? 0) * 0.5,
        max: (peak: any) => (peak.shape?.fwhm ?? 0) * 2,
      },
      mu: { optimize: false },
      x: { optimize: false },
      y: {
        optimize: true,
        init: (peak: any) => peak.y
      },
    },
  },
  {
    // Stage 2: regroup into the real overlapping cluster
    factorLimits: 2,
    maxNumberOfPeaks: 40,
    optimization: {
      kind: 'lm',
      options: { maxIterations: 25, errorTolerance: 1e-4 },
    },
    parameters: {
      fwhm: {
        optimize: true,
        min: (peak: any) => (peak.shape?.fwhm ?? 0) * 0.5,
        max: (peak: any) => (peak.shape?.fwhm ?? 0) * 2,
      },
      mu: { optimize: true },
      x: { optimize: false },
      y: { optimize: true },
    },
  },
  {
    // Stage 3: final polish
    factorLimits: 2,
    maxNumberOfPeaks: 40,
    optimization: {
      kind: 'lm',
      options: { maxIterations: 30, errorTolerance: 1e-5 },
    },
    parameters: {
      fwhm: {
        optimize: true,
        min: (peak: any) => (peak.shape?.fwhm ?? 0) * 0.5,
        max: (peak: any) => (peak.shape?.fwhm ?? 0) * 2,
      },
      mu: { optimize: true },
      x: {
        optimize: true,
        min: (peak: any) => peak.x - (peak.shape?.fwhm ?? 0) / 4,
        max: (peak: any) => peak.x + (peak.shape?.fwhm ?? 0) / 4,
      },
      y: { optimize: true },
    },
  },
  {
    // Stage 3: final polish
    factorLimits: 2,
    maxNumberOfPeaks: 40,
    optimization: {
      kind: 'lm',
      options: { maxIterations: 30, errorTolerance: 1e-5 },
    },
    parameters: {
      fwhm: {
        optimize: true,
        min: (peak: any) => (peak.shape?.fwhm ?? 0) * 0.5,
        max: (peak: any) => (peak.shape?.fwhm ?? 0) * 2,
      },
      mu: { optimize: true },
      x: {
        optimize: true,
        min: (peak: any) => peak.x - (peak.shape?.fwhm ?? 0) / 4,
        max: (peak: any) => peak.x + (peak.shape?.fwhm ?? 0) / 4,
      },
      y: { optimize: true },
    },
  },
],
  });

  return mapPeaks(spectrum.peaks.values.concat(newPeaks), spectrum, {
    checkIsExisting: false,
  });
}
