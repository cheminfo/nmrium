import { gsd } from 'ml-gsd';

export default function autoPeakPicking(xs, ys) {
  // we calculate the noise but this could be improved
  let noise = ys.map((y) => Math.abs(y)).sort()[Math.floor(ys.length / 2)];

  const peaks = gsd(xs, ys, {
    noiseLevel: noise * 3,
    minMaxRatio: 0.01, // Threshold to determine if a given peak should be considered as a noise
    realTopDetection: true,
    maxCriteria: true,
    smoothY: false,
    sgOptions: { windowSize: 7, polynomial: 3 },
  });

  return peaks.map((peak) => {
    return {
      index: peak.index,
      xShift: xs[peak.index] - peak.xShift,
    };
  });
}
