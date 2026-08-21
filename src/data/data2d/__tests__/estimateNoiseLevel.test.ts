import { expect, test } from 'vitest';

import { estimateNoiseLevel } from '../Spectrum2D/findBestMinContour/estimateNoiseLevel.js';

const GAUSSIAN_MAD_SCALE = 1 / 0.6744897501960817;

test('estimates Gaussian noise from a downsampled matrix', () => {
  const matrix = new Float64Array([-2, 99, -1, 99, 1, 99, 2, 99]);

  expect(estimateNoiseLevel(matrix, { maxSamples: 4 })).toBeCloseTo(
    GAUSSIAN_MAD_SCALE,
  );
});

test('rejects invalid sample sizes and zero MAD', () => {
  expect(() =>
    estimateNoiseLevel(new Float64Array([0, 1]), { maxSamples: 0 }),
  ).toThrow('maxSamples must be a positive integer');
});
