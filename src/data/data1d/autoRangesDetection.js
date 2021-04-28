import { xAbsoluteMedian } from 'ml-spectra-processing';
import { xyAutoRangesPicking } from 'nmr-processing';

let defaultPeakPickingOptions = {
  minMaxRatio: 0.05,
  realTopDetection: true,
  maxCriteria: true,
  smoothY: false,
  nH: 100,
  compile: true,
  frequencyCluster: 16,
  clean: true,
  keepPeaks: true,
  sgOptions: { windowSize: 7, polynomial: 3 },
};

export default function autoRangesDetection(datum1D, options = {}) {
  // we calculate the noise but this could be improved
  let noiseLevel = xAbsoluteMedian(datum1D.data.re);

  let { re, x } = datum1D.data;

  const { originFrequency, nucleus } = datum1D.info;

  const { windowFromIndex, windowToIndex, peakPicking } = options;

  const peakPickingOptions = {
    ...defaultPeakPickingOptions,
    ...peakPicking,
  };

  const rangesOptions = {
    frequency: originFrequency,
    nucleus,
    noiseLevel: 3 * noiseLevel,
  };

  if (windowFromIndex !== undefined && windowToIndex !== undefined) {
    x = x.slice(windowFromIndex, windowToIndex);
    re = re.slice(windowFromIndex, windowToIndex);
  }

  const ranges = xyAutoRangesPicking(
    { x, y: re },
    {
      peakPicking: peakPickingOptions,
      ranges: rangesOptions,
    },
  );
  return ranges;
}
