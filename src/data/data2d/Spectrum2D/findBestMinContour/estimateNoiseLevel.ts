import { xMedian } from 'ml-spectra-processing';

const GAUSSIAN_MAD_SCALE = 1 / 0.6744897501960817;
const DEFAULT_MAX_SAMPLES = 65_536;

export interface EstimateNoiseLevelOptions {
  /**
   * Maximum number of evenly spaced finite values used for estimation.
   * @default 65536
   */
  maxSamples?: number;
}

/**
 * Estimates the standard deviation of signed Gaussian noise using a
 * deterministically downsampled median absolute deviation.
 */
export function estimateNoiseLevel(
  matrix: ArrayLike<number>,
  options: EstimateNoiseLevelOptions = {},
): number {
  const { maxSamples = DEFAULT_MAX_SAMPLES } = options;

  if (!Number.isInteger(maxSamples) || maxSamples <= 0) {
    throw new Error('maxSamples must be a positive integer');
  }

  const sample = collectFiniteSample(matrix, maxSamples);

  if (sample.length === 0) {
    throw new Error('matrix must contain at least one finite value');
  }

  const median = xMedian(sample);

  if (median === 0) {
    return 1; //assume NUS reconstruction.
  }

  const averageDeviations = new Float64Array(sample.length);
  for (let i = 0; i < sample.length; i++) {
    averageDeviations[i] = Math.abs(sample[i] - median);
  }

  const noiseLevel = xMedian(averageDeviations) * GAUSSIAN_MAD_SCALE;

  if (!Number.isFinite(noiseLevel) || noiseLevel < 0) {
    throw new Error('unable to estimate a positive noise level');
  }

  return noiseLevel;
}

function collectFiniteSample(
  matrix: ArrayLike<number>,
  maxSamples: number,
): Float64Array {
  const step = Math.max(1, Math.ceil(matrix.length / maxSamples));
  const sample = new Float64Array(Math.ceil(matrix.length / step));
  let sampleIndex = 0;

  for (let index = 0; index < matrix.length; index += step) {
    sample[sampleIndex++] = matrix[index];
  }

  return sample;
}
