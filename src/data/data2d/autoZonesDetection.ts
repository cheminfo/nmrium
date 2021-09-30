import { xyzAutoPeaksPicking } from 'nmr-processing';

export default function autoZonesDetection(data, options) {
  const { thresholdFactor, clean, maxPercentCutOff, convolutionByFFT } =
    options;

  const { nucleus, originFrequency } = options.info;
  const enhanceSymmetry = nucleus[0] === nucleus[1];

  let zones = xyzAutoPeaksPicking(data, {
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
