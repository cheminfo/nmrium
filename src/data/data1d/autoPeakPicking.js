import { gsd } from 'ml-gsd';

export default function autoPeakPicking(datum1D) {
  // we calculate the noise but this could be improved
  let noise = datum1D.data.re.map((y) => Math.abs(y)).sort()[
    Math.floor(datum1D.data.re.length / 2)
  ];
  const peaks = gsd(datum1D.data.x, datum1D.data.re, {
    noiseLevel: noise * 3,
    minMaxRatio: 0.01, // Threshold to determine if a given peak should be considered as a noise
    realTopDetection: true,
    maxCriteria: true,
    smoothY: false,
    sgOptions: { windowSize: 7, polynomial: 3 },
  });

  datum1D.peaks = [];

  return peaks.map((peak) => {
    return {
      xIndex: peak.index,
      xShift: datum1D.data.x[peak.index] - peak.xShift,
    };
  });
}
