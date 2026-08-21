import { expect, test } from 'vitest';

import {
  computePersistence,
  countValuesAboveThreshold,
  createThresholdIndex,
  evaluateThreshold,
  maxPoolAbsolute,
} from '../Spectrum2D/findBestMinContour/evaluation.js';
import { findAutomaticContourLevels } from '../Spectrum2D/findBestMinContour/findAutomaticContourLevels.js';

test('maxPoolAbsolute returns the global finite absolute maximum', () => {
  const analysis = maxPoolAbsolute(
    new Float64Array([-3, Number.NaN, 2, -7, Number.POSITIVE_INFINITY, 4]),
    2,
    3,
    2,
  );

  expect(analysis.maxAbsoluteValue).toBe(7 * 0.95);
});

test('sorted threshold counts preserve direct comparison semantics', () => {
  const matrix = new Float64Array([
    Number.NaN,
    Number.NEGATIVE_INFINITY,
    -1,
    0,
    0,
    2,
    2,
    Number.POSITIVE_INFINITY,
  ]);
  const thresholds = [
    Number.NEGATIVE_INFINITY,
    -1,
    0,
    1,
    2,
    Number.POSITIVE_INFINITY,
    Number.NaN,
  ];

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
