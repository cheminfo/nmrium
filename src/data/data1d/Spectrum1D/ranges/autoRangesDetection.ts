import type { Range } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xyAutoRangesPicking } from 'nmr-processing';
import { isProton } from '../../../utilities/isProton.ts';

const defaultPeakPickingOptions = {
  minMaxRatio: 1,
  shape: { kind: 'lorentzian' },
  realTopDetection: true,
  maxCriteria: true,
  smoothY: true,
  sensitivity: 100,
  broadWidth: 0.25,
  broadRatio: 0.0025,
  integrationSum: 100,
  thresholdFactor: 5,
  sgOptions: { windowSize: 7, polynomial: 3 },
};

export default function autoRangesDetection(
  spectrum: Spectrum1D,
  options: any = {},
): Range[] {
  // we calculate the noise but this could be improved

  let { re, x } = spectrum.data;

  const { originFrequency, nucleus, solvent } = spectrum.info;

  const { windowFromIndex, windowToIndex, peakPicking, rangePicking } = options;

  const peakPickingOptions = {
    ...defaultPeakPickingOptions,
    ...peakPicking,
    frequency: originFrequency,
  };

  const isProtonic = isProton(nucleus);
  const rangesOptions = {
    nucleus,
    clean: 0.3,
    keepPeaks: true,
    compile: isProtonic,
    frequency: originFrequency,
    joinOverlapRanges: isProtonic,
    frequencyCluster: isProtonic ? 13 : 0,
    ...rangePicking,
  };

  if (windowFromIndex !== undefined && windowToIndex !== undefined) {
    x = x.slice(windowFromIndex, windowToIndex);
    re = re.slice(windowFromIndex, windowToIndex);
  }

  peakPickingOptions.smoothY = undefined;
  peakPickingOptions.sgOptions = undefined;

  const ranges = xyAutoRangesPicking(
    { x, y: re },
    {
      impurities: nucleus === '13C' ? { solvent } : undefined,
      peakPicking: peakPickingOptions,
      ranges: rangesOptions,
    },
  );
  return ranges as Range[];
}
