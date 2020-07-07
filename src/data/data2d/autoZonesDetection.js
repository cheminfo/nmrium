import { xyzAutoPeaksPicking } from 'nmr-processing';

export default function autoZonesDetection(datum2D, options) {
  const { thresholdFactor, clean, maxPercentCutOff, enhanceSymmetry } = options;

  const { nucleus, originFrequency } = datum2D.info;
  const isHomoNuclear = nucleus[0] === nucleus[1];

  let zones = xyzAutoPeaksPicking(datum2D.data, {
    isHomoNuclear,
    nucleus,
    observeFrequencies: originFrequency,
    thresholdFactor,
    clean,
    maxPercentCutOff,
    enhanceSymmetry,
  });

  return zones;
}
