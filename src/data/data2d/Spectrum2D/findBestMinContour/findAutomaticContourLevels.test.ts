import { expect, test } from 'vitest';

import { evaluateThreshold } from './evaluation.js';
import { findAutomaticContourLevels } from './findAutomaticContourLevels.js';

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
  });
  expect(withDiagnostics.diagnostics).toBeDefined();
  expect(withoutDiagnostics.diagnostics).toBeUndefined();
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
