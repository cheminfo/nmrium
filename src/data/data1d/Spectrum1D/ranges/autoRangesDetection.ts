import { xyAutoRangesPicking } from 'nmr-processing';

import { Datum1D, Range } from '../../../types/data1d';

const defaultPeakPickingOptions = {
  minMaxRatio: 1,
  shape: { kind: 'lorentzian' },
  realTopDetection: true,
  maxCriteria: true,
  smoothY: false,
  integrationSum: 100,
  factorStd: 5,
  clean: true,
  sgOptions: { windowSize: 7, polynomial: 3 },
};

export default function autoRangesDetection(
  datum1D: Datum1D,
  options: any = {},
): Range[] {
  // we calculate the noise but this could be improved

  let { re, x } = datum1D.data;

  const { originFrequency, nucleus } = datum1D.info;

  const { windowFromIndex, windowToIndex, peakPicking } = options;

  const peakPickingOptions = {
    ...defaultPeakPickingOptions,
    ...peakPicking,
    frequency: originFrequency,
  };

  const rangesOptions = {
    frequency: originFrequency,
    nucleus,
    compile: true,
    frequencyCluster: 13,
    keepPeaks: true,
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
      peakPicking: peakPickingOptions,
      ranges: rangesOptions,
    },
  );
  return ranges as Range[];
}
