import * as SD from 'spectra-data';

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
  const spectrum = SD.NMR.fromXY(datum1D.data.x, datum1D.data.re);
  const ranges = spectrum.createRanges({
    noiseLevel: noise * 3,
    minMaxRatio: minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
    realTopDetection: true,
    maxCriteria: true,
    smoothY: false,
    nH,
    compile,
    frequencyCluster,
    clean,
    keepPeaks,
    sgOptions: { windowSize: 7, polynomial: 3 },
  });

  return ranges;
}
