import { xyAutoRangesPicking } from 'nmr-processing';

const defaultPeakPickingOptions = {
  minMaxRatio: 1,
  realTopDetection: true,
  maxCriteria: true,
  smoothY: false,
  nH: 100,
  factorStd: 5,
  clean: true,
  sgOptions: { windowSize: 7, polynomial: 3 },
};

export default function autoRangesDetection(datum1D, options = {}) {
  // we calculate the noise but this could be improved

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
    compile: true,
    frequencyCluster: 8,
    keepPeaks: true,
  };

  if (windowFromIndex !== undefined && windowToIndex !== undefined) {
    x = x.slice(windowFromIndex, windowToIndex);
    re = re.slice(windowFromIndex, windowToIndex);
  }

  if (originFrequency) {
    let ws = Math.max(Math.round(1 / originFrequency / (x[1] - x[0])), 5);
    peakPickingOptions.sgOptions = {
      windowSize: ws - (ws % 2) + 1,
      polynomial: 3,
    };
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
