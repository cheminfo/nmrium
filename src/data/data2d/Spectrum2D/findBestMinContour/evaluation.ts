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
}

export interface RidgeScores {
  vertical: number;
  horizontal: number;
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
): EvaluatedThreshold {
  const threshold = sigmaMultiplier * noiseLevel;
  const mask = createMask(matrix, threshold);
  const activePixels = countActivePixels(mask);
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
  );
  const ridge = computeRidgeScores(mask, rows, cols, ridgeCoverageThreshold);

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
  matrix: Float64Array,
  rows: number,
  cols: number,
  noiseLevel: number,
  candidates: number[],
  contourRatio: number,
  persistenceLevels: number,
  ridgeCoverageThreshold: number,
  maxFdr: number,
  maxOccupancy: number,
  minPersistence: number,
): EvaluatedThreshold {
  let best: EvaluatedThreshold | undefined;
  let bestScore = Infinity;

  for (const sigma of candidates) {
    const evaluation = evaluateThreshold(
      matrix,
      rows,
      cols,
      noiseLevel,
      sigma,
      contourRatio,
      persistenceLevels,
      ridgeCoverageThreshold,
    );

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
    const evaluation = evaluateThreshold(
      matrix,
      rows,
      cols,
      noiseLevel,
      level / noiseLevel,
      contourRatio,
      1,
      ridgeCoverageThreshold,
    );

    const hasRidge =
      evaluation.verticalRidgeScore > maxVerticalRidgeScore ||
      evaluation.horizontalRidgeScore > maxHorizontalRidgeScore;

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
): number {
  let threshold = initialThreshold;
  let previousArea = countValuesAboveThreshold(matrix, threshold);

  if (previousArea === 0) {
    return 0;
  }

  let minimumPersistence = 1;

  for (let level = 1; level < levels; level++) {
    threshold *= contourRatio;

    const currentArea = countValuesAboveThreshold(matrix, threshold);

    if (currentArea === 0) {
      return 0;
    }

    const persistence = currentArea / previousArea;
    minimumPersistence = Math.min(minimumPersistence, persistence);
    previousArea = currentArea;
  }

  return minimumPersistence;
}

export function computeRidgeScores(
  mask: Uint8Array,
  rows: number,
  cols: number,
  coverageThreshold: number,
): RidgeScores {
  const rowCounts = new Uint32Array(rows);
  const colCounts = new Uint32Array(cols);
  let activePixels = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;

      if (!mask[index]) {
        continue;
      }

      activePixels++;
      rowCounts[row]++;
      colCounts[col]++;
    }
  }

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

export function createMask(
  matrix: Float64Array,
  threshold: number,
): Uint8Array {
  const mask = new Uint8Array(matrix.length);

  for (const [index, value] of matrix.entries()) {
    if (value >= threshold) {
      mask[index] = 1;
    }
  }

  return mask;
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
    }
  }

  return {
    values,
    rows: analysisRows,
    cols: analysisCols,
  };
}

export function countActivePixels(mask: Uint8Array): number {
  let count = 0;

  for (const value of mask) {
    count += value;
  }

  return count;
}

export function countValuesAboveThreshold(
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

export function findMaximumNormalizedValue(
  matrix: Float64Array,
  noiseLevel: number,
): number {
  let maximum = 0;

  for (const value of matrix) {
    const normalized = value / noiseLevel;

    if (normalized > maximum) {
      maximum = normalized;
    }
  }

  return maximum;
}
