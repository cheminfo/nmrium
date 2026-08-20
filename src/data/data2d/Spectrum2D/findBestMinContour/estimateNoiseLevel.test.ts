import { expect, test } from 'vitest';

import { estimateNoiseLevel } from './estimateNoiseLevel.js';

const GAUSSIAN_MAD_SCALE = 1 / 0.6744897501960817;

test('estimates Gaussian noise from a downsampled matrix', () => {
  const matrix = new Float64Array([-2, 99, -1, 99, 1, 99, 2, 99]);

  expect(estimateNoiseLevel(matrix, { maxSamples: 4 })).toBeCloseTo(
    GAUSSIAN_MAD_SCALE,
  );
});

test('ignores non-finite sampled values', () => {
  const matrix = new Float64Array([
    Number.NaN,
    -2,
    0,
    Number.POSITIVE_INFINITY,
    1,
    Number.NEGATIVE_INFINITY,
    2,
  ]);

  expect(estimateNoiseLevel(matrix)).toBeCloseTo(GAUSSIAN_MAD_SCALE);
});

test('rejects invalid sample sizes and zero MAD', () => {
  expect(() =>
    estimateNoiseLevel(new Float64Array([0, 1]), { maxSamples: 0 }),
  ).toThrow('maxSamples must be a positive integer');
  expect(() => estimateNoiseLevel(new Float64Array([0, 0]))).toThrow(
    'unable to estimate a positive noise level',
  );
});
