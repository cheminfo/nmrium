import { xyzAutoPeaksPicking } from 'nmr-processing';

export default function autoZonesDetection(data, options) {
  const { thresholdFactor, clean, maxPercentCutOff, convolutionByFFT } =
    options;

  const { nucleus, originFrequency } = options.info;
  const { enhanceSymmetry = nucleus[0] === nucleus[1] } = options;

  let zones = xyzAutoPeaksPicking(data, {
    nucleus,
    observedFrequencies: originFrequency,
    thresholdFactor,
    clean,
    maxPercentCutOff,
    enhanceSymmetry,
    convolutionByFFT,
  });

  return zones;
}
