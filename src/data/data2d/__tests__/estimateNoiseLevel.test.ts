import { expect, test } from 'vitest';

import { estimateNoiseLevel } from '../Spectrum2D/findBestMinContour/estimateNoiseLevel.js';

const GAUSSIAN_MAD_SCALE = 1 / 0.6744897501960817;

test('estimates Gaussian noise from a downsampled matrix', () => {
  const matrix = new Float64Array([-2, 99, -1, 99, 1, 99, 2, 99]);

  expect(estimateNoiseLevel(matrix, { maxSamples: 4 })).toBeCloseTo(
    GAUSSIAN_MAD_SCALE,
  );
});

test('rejects invalid sample sizes', () => {
  expect(() =>
    estimateNoiseLevel(new Float64Array([0, 1]), { maxSamples: 0 }),
  ).toThrow('maxSamples must be a positive integer');
});

test('returns undefined when there is no detectable noise', () => {
  // Constant plateau: the median is not zero, so the NUS branch does not apply,
  // but the median absolute deviation is zero and there is no scale to measure.
  expect(estimateNoiseLevel(new Float64Array(16).fill(100))).toBeUndefined();
  expect(estimateNoiseLevel(new Float64Array(16).fill(-100))).toBeUndefined();
});

test('returns undefined for an offset plateau with peaks', () => {
  const matrix = new Float64Array(16).fill(100);
  matrix[5] = 1000;
  matrix[10] = 900;

  expect(estimateNoiseLevel(matrix)).toBeUndefined();
});

test('returns undefined for a NUS-like matrix', () => {
  // More than half the values are exactly zero: no noise baseline to measure.
  expect(estimateNoiseLevel(new Float64Array([0, 0, 0, 5]))).toBeUndefined();
});
