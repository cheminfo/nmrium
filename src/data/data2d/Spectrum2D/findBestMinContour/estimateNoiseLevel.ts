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
 *
 * Returns `undefined` when there is no noise to measure: a median of zero (NUS
 * reconstruction) or a median absolute deviation of zero (a constant offset
 * plateau, as in a noiseless simulation). Callers must then anchor their
 * analysis on the data range instead of on a fabricated noise level.
 */
export function estimateNoiseLevel(
  matrix: ArrayLike<number>,
  options: EstimateNoiseLevelOptions = {},
): number | undefined {
  const { maxSamples = DEFAULT_MAX_SAMPLES } = options;

  if (!Number.isSafeInteger(maxSamples) || maxSamples <= 0) {
    throw new Error('maxSamples must be a positive integer');
  }

  const sample = collectFiniteSample(matrix, maxSamples);

  if (sample.length === 0) {
    throw new Error('matrix must contain at least one finite value');
  }

  const median = xMedian(sample);

  if (median === 0) {
    return undefined; //assume NUS reconstruction: no noise baseline to measure.
  }

  const averageDeviations = new Float64Array(sample.length);
  for (let i = 0; i < sample.length; i++) {
    averageDeviations[i] = Math.abs(sample[i] - median);
  }

  const noiseLevel = xMedian(averageDeviations) * GAUSSIAN_MAD_SCALE;

  if (!Number.isFinite(noiseLevel)) {
    throw new Error('unable to estimate a positive noise level');
  }

  // A zero median absolute deviation means a constant plateau: there is no
  // noise scale to measure.
  return noiseLevel === 0 ? undefined : noiseLevel;
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
