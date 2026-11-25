import type { Spectrum2D } from '@zakodium/nmrium-core';
import { matrixCreateEmpty } from 'ml-spectra-processing';
import { expect, test } from 'vitest';

import { initializeContoursLevels } from '../Spectrum2D/contours.js';

type Matrix = ReturnType<typeof matrixCreateEmpty>;

function buildSpectrum2D(z: Matrix) {
  return {
    id: 'test-2d',
    data: { rr: { z } },
    info: { experiment: 'cosy' },
  } as unknown as Spectrum2D;
}

function buildNoRrSpectrum() {
  return {
    id: 'without-rr',
    data: {},
    info: { experiment: 'cosy' },
  } as unknown as Spectrum2D;
}

const emptyMatrix = matrixCreateEmpty({ nbRows: 3, nbColumns: 4 });

/**
 * Matrix holding a single signal: one maximum in the centre and zeros elsewhere,
 * which is enough for the automatic contour algorithm to derive its thresholds.
 */
function buildOnePeakMatrix(size = 64) {
  const matrix = matrixCreateEmpty({ nbRows: size, nbColumns: size });
  matrix[size / 2][size / 2] = 100;
  return matrix;
}

function expectContoursOptionsShape(
  result: ReturnType<typeof initializeContoursLevels>,
) {
  for (const sign of ['positive', 'negative'] as const) {
    expect(result[sign].contourLevels).toHaveLength(2);
    for (const level of result[sign].contourLevels) {
      expect(Number.isFinite(level)).toBe(true);
    }
    expect(Number.isFinite(result[sign].numberOfLayers)).toBe(true);
  }
}

test('all-zero matrix does not throw and matches the no-rr fallback value', () => {
  const result = initializeContoursLevels(buildSpectrum2D(emptyMatrix));
  expect(result).toEqual(initializeContoursLevels(buildNoRrSpectrum()));
  expectContoursOptionsShape(result);
});

test('matrix with one peak keeps finite contour options', () => {
  const result = initializeContoursLevels(
    buildSpectrum2D(buildOnePeakMatrix()),
  );
  expectContoursOptionsShape(result);
  expect(result).not.toEqual(initializeContoursLevels(buildNoRrSpectrum()));
});
