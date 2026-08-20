import { xMaxAbsoluteValue } from 'ml-spectra-processing';

import {
  evaluateFallbackThreshold,
  evaluateThreshold,
  findMaximumNormalizedValue,
  findRidgeFreeThresholdTopDown,
  generateCandidateSigmaLevels,
  maxPoolAbsolute,
} from './evaluation.js';
import { validateInput } from './math.js';

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

export type AutoContourResult<TDiagnostics extends boolean = boolean> = {
  /**
   * Recommended minimum contour level.
   */
  minLevel: number;

  /**
   * Minimum contour level at which detected directional
   * ridge structures (e.g. t1-noise) are no longer present.
   */
  minLevelWithoutT1Noise: number;

  /**
   * Same values expressed in multiples of the noise level.
   */
  sigmaMultiplier: number;
  sigmaMultiplierWithoutT1Noise: number;
} & (TDiagnostics extends true
  ? {
      diagnostics: AutoContourDiagnostics;
    }
  : {
      diagnostics?: AutoContourDiagnostics;
    });

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
  options: AutoContourOptions & { diagnostics: true },
): AutoContourResult<true>;
export function findAutomaticContourLevels(
  matrix: ArrayLike<number>,
  rows: number,
  cols: number,
  noiseLevel: number,
  options?: AutoContourOptions,
): AutoContourResult<true>;
export function findAutomaticContourLevels(
  matrix: ArrayLike<number>,
  rows: number,
  cols: number,
  noiseLevel: number,
  options: AutoContourOptions & { diagnostics: false },
): AutoContourResult<false>;

export function findAutomaticContourLevels(
  matrix: ArrayLike<number>,
  rows: number,
  cols: number,
  noiseLevel: number,
  options: AutoContourOptions = {},
): AutoContourResult<boolean> {
  validateInput(matrix, rows, cols, noiseLevel);

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
    throw new Error('contourRatio must be > 1');
  }

  const analysis = maxPoolAbsolute(matrix, rows, cols, maxAnalysisDimension);
  const { values, rows: analysisRows, cols: analysisCols } = analysis;

  const maxSigmaInData = findMaximumNormalizedValue(values, noiseLevel);
  const candidates = generateCandidateSigmaLevels(
    minSigma,
    maxSigmaInData,
    contourRatio,
    candidateRatioExponent,
  );

  const evaluations: Array<ReturnType<typeof evaluateThreshold>> = [];
  let recommended: ReturnType<typeof evaluateThreshold> | undefined;

  for (const sigmaMultiplier of candidates) {
    const evaluation = evaluateThreshold(
      values,
      analysisRows,
      analysisCols,
      noiseLevel,
      sigmaMultiplier,
      contourRatio,
      persistenceLevels,
      ridgeCoverageThreshold,
      false,
    );
    evaluations.push(evaluation);

    const passed =
      evaluation.fdr <= maxFdr &&
      evaluation.occupancy <= maxOccupancy &&
      evaluation.persistence >= minPersistence;

    if (passed) {
      recommended = evaluation;
      break;
    }
  }

  if (!recommended) {
    recommended = evaluateFallbackThreshold(
      evaluations,
      maxFdr,
      maxOccupancy,
      minPersistence,
    );
  }

  const ridgeFreeLevel = findRidgeFreeThresholdTopDown(
    values,
    analysisRows,
    analysisCols,
    noiseLevel,
    recommended.sigmaMultiplier * noiseLevel,
    xMaxAbsoluteValue(matrix as Float64Array),
    contourRatio,
    maxVerticalRidgeScore,
    maxHorizontalRidgeScore,
    ridgeCoverageThreshold,
  );

  const result: AutoContourResult<boolean> = {
    minLevel: recommended.sigmaMultiplier * noiseLevel,
    minLevelWithoutT1Noise: ridgeFreeLevel,
    sigmaMultiplier: recommended.sigmaMultiplier,
    sigmaMultiplierWithoutT1Noise: ridgeFreeLevel / noiseLevel,
  };

  if (diagnostics) {
    const recommendedDiagnostics = evaluateThreshold(
      values,
      analysisRows,
      analysisCols,
      noiseLevel,
      recommended.sigmaMultiplier,
      contourRatio,
      persistenceLevels,
      ridgeCoverageThreshold,
      true,
    );
    const ridgeFree = evaluateThreshold(
      values,
      analysisRows,
      analysisCols,
      noiseLevel,
      ridgeFreeLevel / noiseLevel,
      contourRatio,
      1,
      ridgeCoverageThreshold,
      true,
    );

    result.diagnostics = {
      recommended: {
        sigmaMultiplier: recommendedDiagnostics.sigmaMultiplier,
        minLevel: recommendedDiagnostics.sigmaMultiplier * noiseLevel,
        occupancy: recommendedDiagnostics.occupancy,
        fdr: recommendedDiagnostics.fdr,
        persistence: recommendedDiagnostics.persistence,
        verticalRidgeScore: recommendedDiagnostics.verticalRidgeScore,
        horizontalRidgeScore: recommendedDiagnostics.horizontalRidgeScore,
      },
      ridgeFree: {
        sigmaMultiplier: ridgeFree.sigmaMultiplier,
        minLevel: ridgeFreeLevel,
        occupancy: ridgeFree.occupancy,
        fdr: ridgeFree.fdr,
        persistence: ridgeFree.persistence,
        verticalRidgeScore: ridgeFree.verticalRidgeScore,
        horizontalRidgeScore: ridgeFree.horizontalRidgeScore,
      },
      hasT1Noise:
        recommendedDiagnostics.verticalRidgeScore > maxVerticalRidgeScore ||
        recommendedDiagnostics.horizontalRidgeScore > maxHorizontalRidgeScore,
    };
  }

  return result;
}
