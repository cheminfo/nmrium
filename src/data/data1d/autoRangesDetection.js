import { xyAutoRangesPicking } from 'nmr-processing';

let defaultOptions = {
  peakPicking: {
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
  },
};

export default function autoRangesDetection(datum1D, options = {}) {
  // we calculate the noise but this could be improved
  let noise = datum1D.data.re.map((y) => Math.abs(y)).sort()[
    Math.floor(datum1D.data.re.length / 2)
  ];

  const { re, x } = datum1D.data;
  const { frequency, nucleus } = datum1D.info;

  options.peakPicking = Object.assign(
    {},
    defaultOptions.peakPicking,
    options.peakPicking,
    {
      frequency,
      nucleus,
      noiseLevel: 3 * noise,
    },
  );

  const ranges = xyAutoRangesPicking({ x, y: re }, options);
  return ranges;
}
