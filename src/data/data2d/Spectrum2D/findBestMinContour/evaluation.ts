import { gaussianTwoSidedTail, violation } from './math.js';

export interface EvaluatedThreshold {
  sigmaMultiplier: number;

  activePixels: number;
  occupancy: number;
  fdr: number;
  persistence: number;

  verticalRidgeScore: number;
  horizontalRidgeScore: number;
}

export interface AnalysisMatrix {
  values: Float64Array;
  rows: number;
  cols: number;
  maxAbsoluteValue: number;
}

interface RidgeScores {
  vertical: number;
  horizontal: number;
}

export interface ThresholdIndex {
  countAtLeast(threshold: number): number;
}

interface ThresholdMetrics {
  activePixels: number;
  ridge: RidgeScores;
}

export function createThresholdIndex(matrix: Float64Array): ThresholdIndex {
  const sortedValues = new Float64Array(matrix.length);
  let valueCount = 0;

  for (const value of matrix) {
    if (!Number.isNaN(value)) {
      sortedValues[valueCount++] = value;
    }
  }

  const values = sortedValues.subarray(0, valueCount);
  values.sort();

  return {
    countAtLeast(threshold) {
      if (Number.isNaN(threshold)) return 0;

      let low = 0;
      let high = values.length;

      while (low < high) {
        const middle = low + Math.floor((high - low) / 2);

        if (values[middle] < threshold) {
          low = middle + 1;
        } else {
          high = middle;
        }
      }

      return values.length - low;
    },
  };
}

function evaluateThresholdMetrics(
  matrix: Float64Array,
  rows: number,
  cols: number,
  threshold: number,
  ridgeCoverageThreshold: number,
  includeRidgeScores: boolean,
  thresholdIndex?: ThresholdIndex,
): ThresholdMetrics {
  if (!includeRidgeScores && thresholdIndex) {
    return {
      activePixels: thresholdIndex.countAtLeast(threshold),
      ridge: { vertical: 0, horizontal: 0 },
    };
  }

  const rowCounts = includeRidgeScores ? new Uint32Array(rows) : undefined;
  const colCounts = includeRidgeScores ? new Uint32Array(cols) : undefined;
  let activePixels = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;

      if (!(matrix[index] >= threshold)) continue;

      activePixels++;
      if (rowCounts && colCounts) {
        rowCounts[row]++;
        colCounts[col]++;
      }
    }
  }

  const ridge =
    rowCounts && colCounts
      ? calculateRidgeScores(
        rowCounts,
        colCounts,
        rows,
        cols,
        activePixels,
        ridgeCoverageThreshold,
      )
      : { vertical: 0, horizontal: 0 };

  return { activePixels, ridge };
}

export function evaluateThreshold(
  matrix: Float64Array,
  rows: number,
  cols: number,
  noiseLevel: number,
  sigmaMultiplier: number,
  contourRatio: number,
  persistenceLevels: number,
  ridgeCoverageThreshold: number,
  includeRidgeScores = true,
  thresholdIndex?: ThresholdIndex,
): EvaluatedThreshold {
  const threshold = sigmaMultiplier * noiseLevel;
  const { activePixels, ridge } = evaluateThresholdMetrics(
    matrix,
    rows,
    cols,
    threshold,
    ridgeCoverageThreshold,
    includeRidgeScores,
    thresholdIndex,
  );
  const totalPixels = rows * cols;
  const occupancy = activePixels / totalPixels;

  if (activePixels === 0) {
    return {
      sigmaMultiplier,
      activePixels: 0,
      occupancy: 0,
      fdr: 0,
      persistence: 0,
      verticalRidgeScore: 0,
      horizontalRidgeScore: 0,
    };
  }

  const expectedNoisePixels =
    totalPixels * gaussianTwoSidedTail(sigmaMultiplier);
  const fdr = Math.min(1, expectedNoisePixels / activePixels);
  const persistence = computePersistence(
    matrix,
    rows,
    cols,
    threshold,
    contourRatio,
    persistenceLevels,
    thresholdIndex,
  );

  return {
    sigmaMultiplier,
    activePixels,
    occupancy,
    fdr,
    persistence,
    verticalRidgeScore: ridge.vertical,
    horizontalRidgeScore: ridge.horizontal,
  };
}

export function evaluateFallbackThreshold(
  evaluations: EvaluatedThreshold[],
  maxFdr: number,
  maxOccupancy: number,
  minPersistence: number,
): EvaluatedThreshold {
  let best: EvaluatedThreshold | undefined;
  let bestScore = Infinity;

  for (const evaluation of evaluations) {
    const score =
      violation(evaluation.fdr, maxFdr) * 4 +
      violation(evaluation.occupancy, maxOccupancy) * 2 +
      violation(minPersistence, evaluation.persistence) * 2;

    if (score < bestScore) {
      bestScore = score;
      best = evaluation;
    }
  }

  if (!best) {
    throw new Error('Unable to evaluate contour thresholds');
  }

  return best;
}

export function findRidgeFreeThresholdTopDown(
  matrix: Float64Array,
  rows: number,
  cols: number,
  noiseLevel: number,
  minLevel: number,
  maxLevel: number,
  contourRatio: number,
  maxVerticalRidgeScore: number,
  maxHorizontalRidgeScore: number,
  ridgeCoverageThreshold: number,
  ridgePersistenceLevels = 1,
): number {
  let level = maxLevel;
  let lastCleanLevel = level;
  let consecutiveRidgeLevels = 0;

  while (level >= minLevel) {
    const ridge = evaluateRidgeScores(
      matrix,
      rows,
      cols,
      (level / noiseLevel) * noiseLevel,
      ridgeCoverageThreshold,
    );

    const hasRidge =
      ridge.vertical > maxVerticalRidgeScore ||
      ridge.horizontal > maxHorizontalRidgeScore;

    if (hasRidge) {
      consecutiveRidgeLevels++;

      if (consecutiveRidgeLevels >= ridgePersistenceLevels) {
        return lastCleanLevel;
      }
    } else {
      consecutiveRidgeLevels = 0;
      lastCleanLevel = level;
    }

    level /= contourRatio;
  }

  return lastCleanLevel;
}

export function generateCandidateSigmaLevels(
  minSigma: number,
  maxSigma: number,
  contourRatio: number,
  exponent: number,
): number[] {
  const step = contourRatio ** exponent;
  const candidates: number[] = [];

  let sigma = minSigma;

  while (sigma <= maxSigma * (1 + 1e-12)) {
    candidates.push(sigma);
    sigma *= step;
  }

  return candidates;
}

export function computePersistence(
  matrix: Float64Array,
  rows: number,
  cols: number,
  initialThreshold: number,
  contourRatio: number,
  levels: number,
  thresholdIndex?: ThresholdIndex,
): number {
  let threshold = initialThreshold;
  let previousArea = thresholdIndex
    ? thresholdIndex.countAtLeast(threshold)
    : countValuesAboveThreshold(matrix, threshold);

  if (previousArea === 0) {
    return 0;
  }

  let minimumPersistence = 1;

  for (let level = 1; level < levels; level++) {
    threshold *= contourRatio;

    const currentArea = thresholdIndex
      ? thresholdIndex.countAtLeast(threshold)
      : countValuesAboveThreshold(matrix, threshold);

    if (currentArea === 0) {
      return 0;
    }

    const persistence = currentArea / previousArea;
    minimumPersistence = Math.min(minimumPersistence, persistence);
    previousArea = currentArea;
  }

  return minimumPersistence;
}

function calculateRidgeScores(
  rowCounts: Uint32Array,
  colCounts: Uint32Array,
  rows: number,
  cols: number,
  activePixels: number,
  coverageThreshold: number,
): RidgeScores {
  if (activePixels === 0) {
    return {
      vertical: 0,
      horizontal: 0,
    };
  }

  let verticalRidgePixels = 0;

  for (let col = 0; col < cols; col++) {
    const coverage = colCounts[col] / rows;

    if (coverage >= coverageThreshold) {
      verticalRidgePixels += colCounts[col];
    }
  }

  let horizontalRidgePixels = 0;

  for (let row = 0; row < rows; row++) {
    const coverage = rowCounts[row] / cols;

    if (coverage >= coverageThreshold) {
      horizontalRidgePixels += rowCounts[row];
    }
  }

  return {
    vertical: verticalRidgePixels / activePixels,
    horizontal: horizontalRidgePixels / activePixels,
  };
}

function evaluateRidgeScores(
  matrix: Float64Array,
  rows: number,
  cols: number,
  threshold: number,
  coverageThreshold: number,
): RidgeScores {
  return evaluateThresholdMetrics(
    matrix,
    rows,
    cols,
    threshold,
    coverageThreshold,
    true,
  ).ridge;
}

export function maxPoolAbsolute(
  matrix: ArrayLike<number>,
  rows: number,
  cols: number,
  maxDimension: number,
): AnalysisMatrix {
  const scale = Math.max(1, Math.ceil(Math.max(rows, cols) / maxDimension));
  const analysisRows = Math.ceil(rows / scale);
  const analysisCols = Math.ceil(cols / scale);
  const values = new Float64Array(analysisRows * analysisCols);
  let maxAbsoluteValue = 0;

  for (let analysisRow = 0; analysisRow < analysisRows; analysisRow++) {
    const sourceRowStart = analysisRow * scale;
    const sourceRowEnd = Math.min(rows, sourceRowStart + scale);

    for (let analysisCol = 0; analysisCol < analysisCols; analysisCol++) {
      const sourceColStart = analysisCol * scale;
      const sourceColEnd = Math.min(cols, sourceColStart + scale);

      let maximum = 0;

      for (let row = sourceRowStart; row < sourceRowEnd; row++) {
        const offset = row * cols;

        for (let col = sourceColStart; col < sourceColEnd; col++) {
          const value = Math.abs(matrix[offset + col]);

          if (Number.isFinite(value) && value > maximum) {
            maximum = value;
          }
        }
      }

      values[analysisRow * analysisCols + analysisCol] = maximum;
      maxAbsoluteValue = Math.max(maxAbsoluteValue, maximum);
    }
  }

  return {
    values,
    rows: analysisRows,
    cols: analysisCols,
    maxAbsoluteValue,
  };
}

function countValuesAboveThreshold(
  matrix: Float64Array,
  threshold: number,
): number {
  let count = 0;

  for (const value of matrix) {
    if (value >= threshold) {
      count++;
    }
  }

  return count;
}
