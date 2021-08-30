import { xyzAutoPeaksPicking } from 'nmr-processing';

export default function autoZonesDetection(data, options) {
  const {
    thresholdFactor,
    clean,
    maxPercentCutOff,
    enhanceSymmetry,
    convolutionByFFT,
  } = options;

  const { nucleus, originFrequency } = options.info;
  const isHomoNuclear = nucleus[0] === nucleus[1];

  let zones = xyzAutoPeaksPicking(data, {
    isHomoNuclear,
    nucleus,
    observeFrequencies: originFrequency,
    thresholdFactor,
    clean,
    maxPercentCutOff,
    enhanceSymmetry,
    convolutionByFFT,
  });

  return zones;
}
