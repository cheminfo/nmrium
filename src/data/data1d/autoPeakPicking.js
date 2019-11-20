import * as SD from 'spectra-data';

export default function autoPeakPicking(datum1D, options) {
  const { minMaxRatio } = options;
  // we calculate the noise but this could be improved
  let noise = datum1D.data.re.map((y) => Math.abs(y)).sort()[
    Math.floor(datum1D.data.re.length / 2)
  ];
  const spectrum = SD.NMR.fromXY(datum1D.data.x, datum1D.data.re);
  const peaks = spectrum.createPeaks({
    noiseLevel: noise * 3,
    minMaxRatio: minMaxRatio, // Threshold to determine if a given peak should be considered as a noise
    realTopDetection: true,
    maxCriteria: true,
    smoothY: false,
    sgOptions: { windowSize: 7, polynomial: 3 },
  });

  return peaks.map((peak) => {
    return {
      xIndex: peak.index,
      xShift: datum1D.data.x[peak.index] - peak.xShift,
    };
  });
}
