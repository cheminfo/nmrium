import { gsd } from 'ml-gsd';

export default function autoPeakPicking(datum1D, options) {
  const { maxNumberOfPeaks, minMaxRatio } = options;
  // we calculate the noise but this could be improved
  let noise = datum1D.data.re.map((y) => Math.abs(y)).sort()[
    Math.floor(datum1D.data.re.length / 2)
  ];
  const peaks = gsd(datum1D.data.x, datum1D.data.re, {
    noiseLevel: noise * 3,
    minMaxRatio: minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
    realTopDetection: true,
    maxCriteria: true,
    smoothY: false,
    sgOptions: { windowSize: 7, polynomial: 3 },
  });

  return peaks.slice(0, maxNumberOfPeaks).map((peak) => {
    return {
      xIndex: peak.index,
      xShift: datum1D.data.x[peak.index] - peak.xShift,
    };
  });
}
