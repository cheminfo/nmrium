export function getContourThresholdFromPercentiles(
  positivePercentiles: readonly number[],
  negativePercentiles: readonly number[],
  options: ContourThresholdOptions = {},
): number {
  const positiveContourLevel = findOptimalContourThreshold(
    positivePercentiles,
    options,
  );
  const negativeContourLevel = findOptimalContourThreshold(
    negativePercentiles,
    options,
  );

  const positiveThreshold =
    positivePercentiles[positiveContourLevel.optimalPercentile];
  const negativeThreshold =
    negativePercentiles[negativeContourLevel.optimalPercentile];

  return Math.max(positiveThreshold, negativeThreshold);
}
/**
 * Finds the optimal minimum contour threshold for a 2D NMR spectrum
 * using the Robust Median-MAD formulation on a percentile-intensity array.
 *
 * @param {number[]} percentiles - Array where index = percentile (0-100),
 *                                 value = intensity at that percentile.
 * @param {object} options - Configuration options
 * @returns {object} - { optimalPercentile, optimalThreshold, maxSNR }
 */
interface ContourThresholdOptions {
  minP?: number;
  maxP?: number;
  madScale?: number;
  scoreRatio?: number;
}

interface OptimalContourMinLevel {
  optimalPercentile: number;
  optimalThreshold: number;
  maxSNR: number;
}

function interpolate(arr: readonly number[], idx: number): number {
  const i = Math.floor(idx);
  const j = Math.ceil(idx);
  if (i === j || i < 0 || j >= arr.length) {
    return arr[Math.max(0, Math.min(arr.length - 1, Math.round(idx)))];
  }
  return arr[i] + (idx - i) * (arr[j] - arr[i]);
}

function findOptimalContourThreshold(
  percentiles: readonly number[],
  options: ContourThresholdOptions = {},
): OptimalContourMinLevel {
  const { minP = 80, maxP = 99, madScale = 1 } = options;

  if (madScale <= 0) {
    throw new Error('madScale must be > 0 to avoid division by zero.');
  }

  // Linear interpolation for non-integer percentile indices

  let bestP = minP;
  let bestSNR = -Infinity;

  for (let p = minP; p <= maxP; p++) {
    const idxMedian = p / 2;
    const idxQ1 = p / 4;
    const idxQ3 = (3 * p) / 4;
    const idxMeanAbove = (p + 100) / 2;

    const medianBelow = interpolate(percentiles, idxMedian);
    const q1Below = interpolate(percentiles, idxQ1);
    const q3Below = interpolate(percentiles, idxQ3);
    const meanAbove = interpolate(percentiles, idxMeanAbove);

    const madBelow = (q3Below - q1Below) / 2;
    if (madBelow <= 0) continue;

    const snr = (meanAbove - medianBelow) / (madBelow * madScale);

    // ✦ Coverage weight: fraction of points ABOVE the threshold
    //   At p=80 → weight=0.20, at p=99 → weight=0.01
    //   This penalizes thresholds that exclude too much.
    const coverage = (100 - p) / 100;

    // Optional: sharpen the penalty with an exponent
    const score = snr * coverage ** 0.5; // sqrt softens it

    if (score > bestSNR) {
      bestSNR = score;
      bestP = p;
    }
  }
  return {
    optimalPercentile: bestP,
    optimalThreshold: interpolate(percentiles, bestP),
    maxSNR: bestSNR,
  };
}