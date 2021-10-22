import { xyzAutoPeaksPicking } from 'nmr-processing';

export default function autoZonesDetection(data, options) {
  const { thresholdFactor, clean, maxPercentCutOff, convolutionByFFT } =
    options;

  const { nucleus: nuclei, originFrequency } = options.info;
  const { enhanceSymmetry = nuclei[0] === nuclei[1] } = options;
  console.log(data.length, data[0].length)
  let zones = xyzAutoPeaksPicking(data, {
    nuclei,
    observedFrequencies: originFrequency,
    thresholdFactor,
    clean,
    maxPercentCutOff,
    enhanceSymmetry,
    convolutionByFFT,
    kernel: { sigma: 2.0, xLength: 15, yLength: 15 },
  });

  return zones;
}
