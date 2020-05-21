import { autoRangesPicking } from 'nmr-processing';

export default function autoRangesDetection(datum1D, options) {
  const {
    minMaxRatio = 0.1,
    nH = 100,
    compile = true,
    frequencyCluster = 16,
    clean = null,
    keepPeaks = true,
  } = options;
  // we calculate the noise but this could be improved
  let noise = datum1D.data.re.map((y) => Math.abs(y)).sort()[
    Math.floor(datum1D.data.re.length / 2)
  ];

  let { frequency, nucleus } = datum1D.info;
  let { re, x } = datum1D.data;
  const ranges = autoRangesPicking(
    { x, y: re },
    {
      noiseLevel: noise * 3,
      minMaxRatio: minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
      realTopDetection: true,
      maxCriteria: true,
      smoothY: false,
      nH,
      compile,
      frequency,
      nucleus,
      frequencyCluster,
      clean,
      keepPeaks,
      sgOptions: { windowSize: 7, polynomial: 3 },
    },
  );
  return ranges;
}
