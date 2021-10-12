import { xyzAutoPeaksPicking } from 'nmr-processing';

export default function autoZonesDetection(data, options) {
  const { thresholdFactor, clean, maxPercentCutOff, convolutionByFFT } =
    options;

  const { nucleus: nuclei, originFrequency } = options.info;
  const { enhanceSymmetry = nuclei[0] === nuclei[1] } = options;

  let zones = xyzAutoPeaksPicking(data, {
    nuclei,
    observedFrequencies: originFrequency,
    thresholdFactor,
    clean,
    maxPercentCutOff,
    enhanceSymmetry,
    convolutionByFFT,
  });

  return zones;
}
