import { expect, test } from 'vitest';

import {
  computePersistence,
  countValuesAboveThreshold,
  createThresholdIndex,
  evaluateThreshold,
  generateCandidateSigmaLevels,
  maxPoolAbsolute,
} from '../Spectrum2D/findBestMinContour/evaluation.js';
import { findAutomaticContourLevels } from '../Spectrum2D/findBestMinContour/findAutomaticContourLevels.js';

test('maxPoolAbsolute returns the global finite absolute maximum', () => {
  const analysis = maxPoolAbsolute(
    new Float64Array([-3, NaN, 2, -7, Infinity, 4]),
    2,
    3,
    2,
  );

  expect(analysis.maxAbsoluteValue).toBe(7 * 0.95);
});

test('sorted threshold counts preserve direct comparison semantics', () => {
  const matrix = new Float64Array([NaN, -Infinity, -1, 0, 0, 2, 2, Infinity]);
  const thresholds = [-Infinity, -1, 0, 1, 2, Infinity, NaN];

  const thresholdIndex = createThresholdIndex(matrix);

  for (const threshold of thresholds) {
    expect(thresholdIndex.countAtLeast(threshold)).toBe(
      countValuesAboveThreshold(matrix, threshold),
    );
  }

  expect(
    computePersistence(matrix, 1, matrix.length, -1, 2, 4, thresholdIndex),
  ).toBe(computePersistence(matrix, 1, matrix.length, -1, 2, 4));

  expect(
    evaluateThreshold(
      matrix,
      1,
      matrix.length,
      1,
      0,
      2,
      4,
      0.5,
      false,
      thresholdIndex,
    ),
  ).toEqual(
    evaluateThreshold(matrix, 1, matrix.length, 1, 0, 2, 4, 0.5, false),
  );
});

test('skipping ridge metrics preserves threshold selection metrics', () => {
  const matrix = new Float64Array([0, 2, 3, 0]);
  const withRidgeMetrics = evaluateThreshold(matrix, 2, 2, 1, 2, 1.5, 2, 0.5);
  const withoutRidgeMetrics = evaluateThreshold(
    matrix,
    2,
    2,
    1,
    2,
    1.5,
    2,
    0.5,
    false,
  );

  expect(withoutRidgeMetrics).toEqual({
    ...withRidgeMetrics,
    verticalRidgeScore: 0,
    horizontalRidgeScore: 0,
  });
  expect(withRidgeMetrics.verticalRidgeScore).toBe(1);
  expect(withRidgeMetrics.horizontalRidgeScore).toBe(1);
});

test('diagnostics do not change selected contour levels', () => {
  const matrix = new Float64Array(36);
  matrix[7] = 3;
  matrix[21] = 8;
  const options = {
    contourRatio: 1.6,
    maxFdr: 0.01,
    maxOccupancy: 0.2,
    minPersistence: 0.35,
    minSigma: 2,
    candidateRatioExponent: 0.5,
    persistenceLevels: 1,
    maxVerticalRidgeScore: 0.25,
    maxHorizontalRidgeScore: 0.25,
    ridgeCoverageThreshold: 0.5,
  };

  const withDiagnostics = findAutomaticContourLevels(matrix, 6, 6, 1, {
    ...options,
    diagnostics: true,
  });
  const withoutDiagnostics = findAutomaticContourLevels(matrix, 6, 6, 1, {
    ...options,
    diagnostics: false,
  });

  expect(withoutDiagnostics).toMatchObject({
    minLevel: withDiagnostics.minLevel,
    minLevelWithoutT1Noise: withDiagnostics.minLevelWithoutT1Noise,
    sigmaMultiplier: withDiagnostics.sigmaMultiplier,
    sigmaMultiplierWithoutT1Noise:
      withDiagnostics.sigmaMultiplierWithoutT1Noise,
    hasT1Noise: withDiagnostics.hasT1Noise,
  });
  expect(withDiagnostics.diagnostics).toBeDefined();
  expect(withoutDiagnostics.diagnostics).toBeUndefined();
  expect(withoutDiagnostics.hasT1Noise).toBe(withDiagnostics.hasT1Noise);
});

test('fallback uses the first cached candidate when scores tie', () => {
  const matrix = new Float64Array([
    0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  const result = findAutomaticContourLevels(matrix, 4, 4, 1, {
    contourRatio: 2,
    candidateRatioExponent: 1,
    minSigma: 2,
    maxFdr: 0,
    maxOccupancy: 0,
    minPersistence: 1,
    diagnostics: false,
  });

  expect(result.sigmaMultiplier).toBe(2);
});

test('candidate ladder always yields at least one candidate', () => {
  // maxSigma = Infinity (a zero noise level): previously an unbounded loop that
  // ended in `RangeError: Invalid array length`.
  expect(generateCandidateSigmaLevels(5, Infinity, 1.8, 0.5)).toEqual([5]);
  expect(generateCandidateSigmaLevels(5, NaN, 1.8, 0.5)).toEqual([5]);
  expect(generateCandidateSigmaLevels(5, 0, 1.8, 0.5)).toEqual([5]);
  // No dynamic range left: one candidate instead of an empty ladder.
  expect(generateCandidateSigmaLevels(5, 0.95, 1.8, 0.5)).toEqual([0.95]);
});

test('candidate ladder is unchanged when minSigma fits the data range', () => {
  expect(generateCandidateSigmaLevels(2, 8, 2, 1)).toEqual([2, 4, 8]);
});

test('candidate ladder rejects a non positive minSigma', () => {
  expect(() => generateCandidateSigmaLevels(0, 8, 2, 1)).toThrow(
    'minSigma must be a positive number',
  );
});

test('a normalized spectrum below the minSigma floor still yields levels', () => {
  // Normalized 2D spectrum (max |z| = 1) with more than half exact zeros: the
  // noise estimator returns the unit sentinel and the whole data range sits
  // below the `minSigma * noiseLevel` floor.
  const matrix = new Float64Array(64);
  matrix[27] = 1;
  matrix[28] = 0.8;
  matrix[19] = 0.5;

  const result = findAutomaticContourLevels(matrix, 8, 8, 1, {
    maxFdr: 0.005,
    maxOccupancy: 0.005,
    persistenceLevels: 5,
    contourRatio: 1.8,
    minPersistence: 0.5,
    maxVerticalRidgeScore: 0.05,
    maxHorizontalRidgeScore: 0.05,
    ridgeCoverageThreshold: 0.1,
    diagnostics: false,
  });

  expect(result.minLevel).toBeCloseTo(0.95);
});

test('a constant offset plateau does not prevent contour selection', () => {
  // Baseline at 100 with two peaks: the median is 100, the median absolute
  // deviation is zero, and the selected level must sit above the plateau.
  const matrix = new Float64Array(16).fill(100);
  matrix[5] = 1000;
  matrix[10] = 900;

  const result = findAutomaticContourLevels(matrix, 4, 4, 1, {
    maxFdr: 0.005,
    maxOccupancy: 0.005,
    persistenceLevels: 5,
    contourRatio: 1.8,
    minPersistence: 0.5,
    maxVerticalRidgeScore: 0.05,
    maxHorizontalRidgeScore: 0.05,
    ridgeCoverageThreshold: 0.1,
    diagnostics: false,
  });

  expect(result.minLevel).toBeGreaterThan(100);
});

test('noiseLevel is optional but never invalid', () => {
  const matrix = new Float64Array(16).fill(1);

  expect(() =>
    findAutomaticContourLevels(matrix, 4, 4, 0, { diagnostics: false }),
  ).toThrow('noiseLevel must be a positive finite number');
  expect(() =>
    findAutomaticContourLevels(matrix, 4, 4, NaN, { diagnostics: false }),
  ).toThrow('noiseLevel must be a positive finite number');
  expect(() =>
    findAutomaticContourLevels(matrix, 4, 4, undefined, { diagnostics: false }),
  ).not.toThrow();
});

test('without a noise estimate the ladder is anchored on the data range', () => {
  // Normalized spectrum with more than half exact zeros: there is no noise to
  // measure, so thresholds are fractions of the data maximum instead of
  // multiples of a fabricated noise level.
  const matrix = new Float64Array(10_000);
  matrix[27] = 1;
  matrix[28] = 0.8;
  matrix[19] = 0.5;

  const result = findAutomaticContourLevels(matrix, 100, 100, undefined, {
    maxOccupancy: 0.005,
    persistenceLevels: 5,
    contourRatio: 1.8,
    minPersistence: 0.5,
    maxVerticalRidgeScore: 0.05,
    maxHorizontalRidgeScore: 0.05,
    ridgeCoverageThreshold: 0.1,
    diagnostics: false,
  });

  expect(result.sigmaMultiplier).toBeGreaterThanOrEqual(0.005);
  expect(result.sigmaMultiplier).toBeLessThanOrEqual(1);
  expect(result.minLevel).toBeCloseTo(
    result.sigmaMultiplier * result.maxAbsoluteValue,
  );
});

test('a constant offset plateau works without a noise estimate', () => {
  const matrix = new Float64Array(16).fill(100);
  matrix[5] = 1000;
  matrix[10] = 900;

  const result = findAutomaticContourLevels(matrix, 4, 4, undefined, {
    maxOccupancy: 0.005,
    persistenceLevels: 5,
    contourRatio: 1.8,
    minPersistence: 0.5,
    maxVerticalRidgeScore: 0.05,
    maxHorizontalRidgeScore: 0.05,
    ridgeCoverageThreshold: 0.1,
    diagnostics: false,
  });

  expect(result.minLevel).toBeGreaterThan(100);
});
