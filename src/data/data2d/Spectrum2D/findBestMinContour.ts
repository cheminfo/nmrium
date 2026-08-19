import { xMaxAbsoluteValue } from "ml-spectra-processing";

export interface AutoContourDiagnostics {
  recommended: ThresholdDiagnostics;
  ridgeFree: ThresholdDiagnostics;

  /**
   * True when directional ridge structures were detected
   * at the recommended minimum.
   */
  hasT1Noise: boolean;
}

export interface ThresholdDiagnostics {
  sigmaMultiplier: number;
  minLevel: number;

  occupancy: number;
  fdr: number;
  persistence: number;

  verticalRidgeScore: number;
  horizontalRidgeScore: number;
}

export interface AutoContourResult {
  /**
   * Recommended minimum contour level.
   *
   * Optimized for preserving meaningful weak peaks while
   * avoiding ordinary noise.
   */
  minLevel: number;

  /**
   * Minimum contour level at which detected directional
   * ridge structures (e.g. t1-noise) are no longer present.
   *
   * This is useful as an optional "ridge-free" visualization.
   */
  minLevelWithoutT1Noise: number;

  /**
   * Same values expressed in multiples of the noise level.
   */
  sigmaMultiplier: number;
  sigmaMultiplierWithoutT1Noise: number;

  diagnostics?: AutoContourDiagnostics;
}

export interface AutoContourOptions {
  /**
   * Multiplicative ratio between consecutive contour levels.
   *
   * The contour levels are generated as:
   *
   *   Lₙ = L₀ × contourRatioⁿ
   *
   * Must be greater than 1.
   *
   * A smaller value produces more closely spaced contour levels,
   * while a larger value produces fewer, more widely spaced levels.
   *
   * @default 1.4
   */
  contourRatio?: number;

  /**
   * Maximum acceptable false discovery rate (FDR) for the
   * automatically selected minimum contour level.
   *
   * The FDR estimates the fraction of pixels above the selected
   * threshold that could be explained by Gaussian noise, assuming
   * the supplied noiseLevel is accurate.
   *
   * Smaller values produce a cleaner visualization but may suppress
   * weak peaks.
   *
   * @default 0.05
   */
  maxFdr?: number;

  /**
   * Maximum fraction of the spectrum that may be above the
   * automatically selected minimum contour level.
   *
   * This prevents very low thresholds from producing contours over
   * a large fraction of the spectrum.
   *
   * Expressed as a fraction in the range [0, 1].
   *
   * For example, 0.02 means that at most 2% of pixels may be above
   * the minimum contour threshold.
   *
   * @default 0.02
   */
  maxOccupancy?: number;

  /**
   * Minimum persistence required for spectral structures across
   * successive exponential contour levels.
   *
   * Persistence measures how much of the active spectral structure
   * remains when moving from one contour level to the next.
   *
   * Higher values favor stable, coherent peaks and reject fragmented
   * noise structures more aggressively.
   *
   * Expressed as a fraction in the range [0, 1].
   *
   * @default 0.35
   */
  minPersistence?: number;

  /**
   * Maximum acceptable score for vertical ridge-like structures.
   *
   * This is primarily intended to detect structured artifacts such
   * as t1 noise, which often appears as elongated structures along
   * the F1 dimension.
   *
   * Smaller values make the ridge-free threshold more conservative.
   *
   * @default 0.25
   */
  maxVerticalRidgeScore?: number;

  /**
   * Maximum acceptable score for horizontal ridge-like structures.
   *
   * This can detect horizontal streaks or other structured artifacts
   * extending predominantly along the F2 dimension.
   *
   * Smaller values make the ridge-free threshold more conservative.
   *
   * @default 0.25
   */
  maxHorizontalRidgeScore?: number;

  /**
   * Fraction of a row or column that must be occupied by active
   * contour pixels for the row or column to be considered
   * ridge-like.
   *
   * For vertical ridge detection, a column is considered suspicious
   * when the fraction of active pixels along F1 is greater than or
   * equal to this value.
   *
   * For horizontal ridge detection, the same criterion is applied
   * along F2.
   *
   * Expressed as a fraction in the range [0, 1].
   *
   * Lower values make ridge detection more sensitive.
   *
   * @default 0.5
   */
  ridgeCoverageThreshold?: number;

  /**
   * Lowest threshold considered by the automatic contour search,
   * expressed as a multiple of the supplied noise level.
   *
   * For example, minSigma = 2 means that thresholds below 2 ×
   * noiseLevel are never considered.
   *
   * Lower values can preserve weaker peaks but increase the risk
   * of including noise.
   *
   * @default 2
   */
  minSigma?: number;

  /**
   * Exponent used to determine the spacing between candidate
   * minimum contour levels.
   *
   * Candidate thresholds are generated multiplicatively using:
   *
   *   candidateStep = contourRatio ** candidateRatioExponent
   *
   * For example, with contourRatio = 1.4 and exponent = 0.5:
   *
   *   candidateStep = sqrt(1.4)
   *
   * A value of 1 evaluates candidates directly on the contour-level
   * hierarchy. Smaller values provide finer threshold resolution
   * while increasing the amount of analysis.
   *
   * @default 0.5
   */
  candidateRatioExponent?: number;

  /**
   * Number of successive contour levels used when evaluating
   * spectral persistence.
   *
   * A larger value requires spectral structures to remain stable
   * across more contour levels and therefore produces a more
   * conservative threshold.
   *
   * @default 4
   */
  persistenceLevels?: number;

  /**
   * Maximum dimension used for spatial analysis.
   *
   * Large input matrices are reduced using max pooling before
   * calculating occupancy, persistence, and ridge metrics.
   *
   * The original matrix is not modified.
   *
   * Max pooling is used instead of averaging so that narrow,
   * high-intensity spectral features are preserved during analysis.
   *
   * Larger values improve spatial resolution but increase
   * computational cost and memory usage.
   *
   * @default 384
   */
  maxAnalysisDimension?: number;

  /**
   * Whether diagnostic information should be returned.
   *
   * Diagnostics include the selected thresholds, FDR, occupancy,
   * persistence, vertical and horizontal ridge scores, and the
   * individual criteria used by the automatic threshold selection.
   *
   * Disable this when diagnostics are not needed and the smallest
   * possible result object is preferred.
   *
   * @default true
   */
  diagnostics?: boolean;
}



export function findAutomaticContourLevels(
  matrix: ArrayLike<number>,
  rows: number,
  cols: number,
  noiseLevel: number,
  options: AutoContourOptions = {},
): AutoContourResult {
  validateInput(
    matrix,
    rows,
    cols,
    noiseLevel,
  );

  const {
    contourRatio = 1.4,

    maxFdr = 0.05,
    maxOccupancy = 0.02,
    minPersistence = 0.35,

    maxVerticalRidgeScore = 0.25,
    maxHorizontalRidgeScore = 0.25,

    ridgeCoverageThreshold = 0.5,

    minSigma = 5,

    candidateRatioExponent = 0.5,

    persistenceLevels = 4,

    maxAnalysisDimension = 384,

    diagnostics = true,
  } = options;

  if (contourRatio <= 1) {
    throw new Error(
      'contourRatio must be > 1',
    );
  }

  /*
   * Analyze a max-pooled representation.
   */
  const analysis = maxPoolAbsolute(
    matrix,
    rows,
    cols,
    maxAnalysisDimension,
  );

  const {
    values,
    rows: analysisRows,
    cols: analysisCols,
  } = analysis;

  const maxSigmaInData =
    findMaximumNormalizedValue(
      values,
      noiseLevel,
    );
  /*
   * Generate candidate minimum thresholds.
   */
  const candidates =
    generateCandidateSigmaLevels(
      minSigma,
      maxSigmaInData,
      contourRatio,
      candidateRatioExponent,
    );

  /*
   * -------------------------------------------------------
   * STEP 1
   *
   * Find the lowest threshold that is statistically clean
   * and sufficiently persistent.
   *
   * t1-ridges are deliberately NOT rejected here.
   * -------------------------------------------------------
   */

  let recommended:
    EvaluatedThreshold | undefined;

  for (const sigmaMultiplier of candidates) {
    const evaluation =
      evaluateThreshold(
        values,
        analysisRows,
        analysisCols,
        noiseLevel,
        sigmaMultiplier,
        contourRatio,
        persistenceLevels,
        ridgeCoverageThreshold,
      );

    const passed =
      evaluation.fdr <= maxFdr &&
      evaluation.occupancy <= maxOccupancy &&
      evaluation.persistence >= minPersistence;

    if (passed) {
      recommended = evaluation;
      break;
    }
  }

  /*
   * Fallback when no candidate satisfies all conditions.
   */
  if (!recommended) {
    recommended =
      evaluateFallbackThreshold(
        values,
        analysisRows,
        analysisCols,
        noiseLevel,
        candidates,
        contourRatio,
        persistenceLevels,
        ridgeCoverageThreshold,
        maxFdr,
        maxOccupancy,
        minPersistence,
      );
  }

  /*
   * -------------------------------------------------------
   * STEP 2
   *
   * Find the first threshold >= recommended where the
   * directional ridge disappears.
   * -------------------------------------------------------
   */

  const ridgeFreeLevel =
    findRidgeFreeThresholdTopDown(
      values,
      analysisRows,
      analysisCols,
      noiseLevel,
      recommended.sigmaMultiplier *
        noiseLevel,
      xMaxAbsoluteValue(matrix as Float64Array),
      contourRatio,
      maxVerticalRidgeScore,
      maxHorizontalRidgeScore,
      ridgeCoverageThreshold,
    );

  const ridgeFree =
    evaluateThreshold(
      values,
      analysisRows,
      analysisCols,
      noiseLevel,
      ridgeFreeLevel / noiseLevel,
      contourRatio,
      1,
      ridgeCoverageThreshold,
    );

  const result: AutoContourResult = {
    minLevel:
      recommended.sigmaMultiplier *
      noiseLevel,

    minLevelWithoutT1Noise:
      ridgeFreeLevel,

    sigmaMultiplier:
      recommended.sigmaMultiplier,

    sigmaMultiplierWithoutT1Noise:
      ridgeFreeLevel / noiseLevel,
  };

  if (diagnostics) {
    result.diagnostics = {
      recommended: {
        sigmaMultiplier:
          recommended.sigmaMultiplier,

        minLevel:
          recommended.sigmaMultiplier *
          noiseLevel,

        occupancy:
          recommended.occupancy,

        fdr:
          recommended.fdr,

        persistence:
          recommended.persistence,

        verticalRidgeScore:
          recommended.verticalRidgeScore,

        horizontalRidgeScore:
          recommended.horizontalRidgeScore,
      },

      ridgeFree: {
        sigmaMultiplier:
          ridgeFree.sigmaMultiplier,

        minLevel:
          ridgeFreeLevel,

        occupancy:
          ridgeFree.occupancy,

        fdr:
          ridgeFree.fdr,

        persistence:
          ridgeFree.persistence,

        verticalRidgeScore:
          ridgeFree.verticalRidgeScore,

        horizontalRidgeScore:
          ridgeFree.horizontalRidgeScore,
      },

      hasT1Noise:
        recommended.verticalRidgeScore >
          maxVerticalRidgeScore ||
        recommended.horizontalRidgeScore >
          maxHorizontalRidgeScore,
    };
  }

  return result;
}

interface EvaluatedThreshold {
  sigmaMultiplier: number;

  activePixels: number;
  occupancy: number;
  fdr: number;
  persistence: number;

  verticalRidgeScore: number;
  horizontalRidgeScore: number;
}

function evaluateThreshold(
  matrix: Float64Array,
  rows: number,
  cols: number,
  noiseLevel: number,
  sigmaMultiplier: number,
  contourRatio: number,
  persistenceLevels: number,
  ridgeCoverageThreshold: number,
): EvaluatedThreshold {
  const threshold =
    sigmaMultiplier * noiseLevel;

  const mask =
    createMask(
      matrix,
      threshold,
    );

  const activePixels =
    countActivePixels(mask);

  const totalPixels =
    rows * cols;

  const occupancy =
    activePixels / totalPixels;

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
    totalPixels *
    gaussianTwoSidedTail(
      sigmaMultiplier,
    );

  const fdr =
    Math.min(
      1,
      expectedNoisePixels /
        activePixels,
    );

  const persistence =
    computePersistence(
      matrix,
      rows,
      cols,
      threshold,
      contourRatio,
      persistenceLevels,
    );

  const ridge =
    computeRidgeScores(
      mask,
      rows,
      cols,
      ridgeCoverageThreshold,
    );

  return {
    sigmaMultiplier,

    activePixels,
    occupancy,

    fdr,
    persistence,

    verticalRidgeScore:
      ridge.vertical,

    horizontalRidgeScore:
      ridge.horizontal,
  };
}

function evaluateFallbackThreshold(
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
  let best:
    EvaluatedThreshold | undefined;

  let bestScore = Infinity;

  for (const sigma of candidates) {
    const evaluation =
      evaluateThreshold(
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
      violation(
        evaluation.fdr,
        maxFdr,
      ) * 4 +

      violation(
        evaluation.occupancy,
        maxOccupancy,
      ) * 2 +

      violation(
        minPersistence,
        evaluation.persistence,
      ) * 2;

    if (score < bestScore) {
      bestScore = score;
      best = evaluation;
    }
  }

  if (!best) {
    throw new Error(
      'Unable to evaluate contour thresholds',
    );
  }

  return best;
}

function findRidgeFreeThresholdTopDown(
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
  ridgePersistenceLevels = 2,
): number {
  /*
   * Start from the actual maximum contour level.
   */
  let level = maxLevel;

  let lastCleanLevel = level;

  let consecutiveRidgeLevels = 0;

  while (level >= minLevel) {
    const evaluation =
      evaluateThreshold(
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
      evaluation.verticalRidgeScore >
        maxVerticalRidgeScore ||
      evaluation.horizontalRidgeScore >
        maxHorizontalRidgeScore;

    if (hasRidge) {
      consecutiveRidgeLevels++;

      if (
        consecutiveRidgeLevels >=
        ridgePersistenceLevels
      ) {
        /*
         * The ridge has appeared persistently.
         *
         * The previous clean level is the answer.
         */
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
function generateCandidateSigmaLevels(
  minSigma: number,
  maxSigma: number,
  contourRatio: number,
  exponent: number,
): number[] {
  const step =
    contourRatio ** exponent;

  const candidates: number[] = [];

  let sigma = minSigma;

  while (
    sigma <=
    maxSigma * (1 + 1e-12)
  ) {
    candidates.push(sigma);
    sigma *= step;
  }

  return candidates;
}


function computePersistence(
  matrix: Float64Array,
  rows: number,
  cols: number,
  initialThreshold: number,
  contourRatio: number,
  levels: number,
): number {
  let threshold = initialThreshold;

  let previousArea =
    countValuesAboveThreshold(
      matrix,
      threshold,
    );

  if (previousArea === 0) {
    return 0;
  }

  let minimumPersistence = 1;

  for (let level = 1; level < levels; level++) {
    threshold *= contourRatio;

    const currentArea =
      countValuesAboveThreshold(
        matrix,
        threshold,
      );

    if (currentArea === 0) {
      return 0;
    }

    const persistence =
      currentArea / previousArea;

    minimumPersistence = Math.min(
      minimumPersistence,
      persistence,
    );

    previousArea = currentArea;
  }

  return minimumPersistence;
}

interface RidgeScores {
  vertical: number;
  horizontal: number;
}

function computeRidgeScores(
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

  /*
   * A vertical ridge occupies a large fraction of F1
   * in one or more F2 columns.
   */
  let verticalRidgePixels = 0;

  for (let col = 0; col < cols; col++) {
    const coverage =
      colCounts[col] / rows;

    if (coverage >= coverageThreshold) {
      verticalRidgePixels +=
        colCounts[col];
    }
  }

  /*
   * A horizontal ridge occupies a large fraction of F2
   * in one or more F1 rows.
   */
  let horizontalRidgePixels = 0;

  for (let row = 0; row < rows; row++) {
    const coverage =
      rowCounts[row] / cols;

    if (coverage >= coverageThreshold) {
      horizontalRidgePixels +=
        rowCounts[row];
    }
  }

  return {
    vertical:
      verticalRidgePixels / activePixels,

    horizontal:
      horizontalRidgePixels / activePixels,
  };
}

function createMask(
  matrix: Float64Array,
  threshold: number,
): Uint8Array {
  const mask = new Uint8Array(matrix.length);

  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i] >= threshold) {
      mask[i] = 1;
    }
  }

  return mask;
}

interface AnalysisMatrix {
  values: Float64Array;
  rows: number;
  cols: number;
}

function maxPoolAbsolute(
  matrix: ArrayLike<number>,
  rows: number,
  cols: number,
  maxDimension: number,
): AnalysisMatrix {
  const scale =
    Math.max(
      1,
      Math.ceil(
        Math.max(rows, cols) /
          maxDimension,
      ),
    );

  const analysisRows =
    Math.ceil(rows / scale);

  const analysisCols =
    Math.ceil(cols / scale);

  const values =
    new Float64Array(
      analysisRows * analysisCols,
    );

  for (
    let analysisRow = 0;
    analysisRow < analysisRows;
    analysisRow++
  ) {
    const sourceRowStart =
      analysisRow * scale;

    const sourceRowEnd =
      Math.min(
        rows,
        sourceRowStart + scale,
      );

    for (
      let analysisCol = 0;
      analysisCol < analysisCols;
      analysisCol++
    ) {
      const sourceColStart =
        analysisCol * scale;

      const sourceColEnd =
        Math.min(
          cols,
          sourceColStart + scale,
        );

      let maximum = 0;

      for (
        let row = sourceRowStart;
        row < sourceRowEnd;
        row++
      ) {
        const offset = row * cols;

        for (
          let col = sourceColStart;
          col < sourceColEnd;
          col++
        ) {
          const value =
            Math.abs(matrix[offset + col]);

          if (
            Number.isFinite(value) &&
            value > maximum
          ) {
            maximum = value;
          }
        }
      }

      values[
        analysisRow * analysisCols +
          analysisCol
      ] = maximum;
    }
  }

  return {
    values,
    rows: analysisRows,
    cols: analysisCols,
  };
}

function countActivePixels(
  mask: Uint8Array,
): number {
  let count = 0;

  for (let i = 0; i < mask.length; i++) {
    count += mask[i];
  }

  return count;
}

function countValuesAboveThreshold(
  matrix: Float64Array,
  threshold: number,
): number {
  let count = 0;

  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i] >= threshold) {
      count++;
    }
  }

  return count;
}

function findMaximumNormalizedValue(
  matrix: Float64Array,
  noiseLevel: number,
): number {
  let maximum = 0;

  for (let i = 0; i < matrix.length; i++) {
    const value =
      matrix[i] / noiseLevel;

    if (value > maximum) {
      maximum = value;
    }
  }

  return maximum;
}

function gaussianTwoSidedTail(
  k: number,
): number {
  return erfc(k / Math.SQRT2);
}

/**
 * Approximation of the complementary error function.
 */
function erfc(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);

  const p = 0.3275911;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1 / (1 + p * ax);

  const polynomial =
    (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) *
    t;

  const result =
    polynomial * Math.exp(-ax * ax);

  return sign >= 0
    ? result
    : 2 - result;
}

function violation(
  value: number,
  limit: number,
): number {
  if (limit === 0) {
    return value === 0 ? 0 : 1;
  }

  return Math.max(
    0,
    value / limit - 1,
  );
}

function validateInput(
  matrix: ArrayLike<number>,
  rows: number,
  cols: number,
  noiseLevel: number,
): void {
  if (!Number.isInteger(rows) || rows <= 0) {
    throw new Error(
      'rows must be a positive integer',
    );
  }

  if (!Number.isInteger(cols) || cols <= 0) {
    throw new Error(
      'cols must be a positive integer',
    );
  }

  if (matrix.length !== rows * cols) {
    throw new Error(
      'matrix.length must equal rows * cols',
    );
  }

  if (
    !Number.isFinite(noiseLevel) ||
    noiseLevel <= 0
  ) {
    throw new Error(
      'noiseLevel must be a positive finite number',
    );
  }
}