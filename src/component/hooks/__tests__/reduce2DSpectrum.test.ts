import { expect, test } from 'vitest';

import { reduce2DSpectrum } from '../reduce2DSpectrum.ts';

test('reduce 1001x1001 matrix', () => {
  const size = 11;
  const z: Float64Array[] = [];
  for (let row = 0; row < size; row++) {
    const rowData = new Float64Array(size);
    for (let col = 0; col < size; col++) {
      rowData[col] = 1000 + col + row;
    }
    z.push(rowData);
  }

  const data = {
    minX: 1000,
    maxX: 2000,
    minY: 1000,
    maxY: 2000,
    minZ: 1000,
    maxZ: 2000,
    z,
  };

  const result = reduce2DSpectrum(data, {
    fromX: 1000,
    toX: 2000,
    fromY: 1000,
    toY: 2000,
    numberOfPoints: 4,
  });

  expect(result).toStrictEqual({
    minX: 1000,
    maxX: 2000,
    minY: 1000,
    maxY: 2000,
    minZ: 1000,
    maxZ: 2000,
    z: [
      Float64Array.from([1002, 1005, 1008, 1011]),
      Float64Array.from([1005, 1008, 1011, 1014]),
      Float64Array.from([1008, 1011, 1014, 1017]),
      Float64Array.from([1011, 1014, 1017, 1020]),
    ],
  });
});

test('reduce matrix with negative values uses min when sum is negative', () => {
  const size = 8;
  const z: Float64Array[] = [];
  for (let row = 0; row < size; row++) {
    const rowData = new Float64Array(size);
    for (let col = 0; col < size; col++) {
      rowData[col] = -10 + col + row;
    }
    z.push(rowData);
  }

  const data = {
    minX: 0,
    maxX: 70,
    minY: 0,
    maxY: 70,
    minZ: -10,
    maxZ: 4,
    z,
  };

  const result = reduce2DSpectrum(data, {
    fromX: 0,
    toX: 70,
    fromY: 0,
    toY: 70,
    numberOfPoints: 4,
  });

  expect(result.z.length).toBe(4);
  expect(result.z[0].length).toBe(4);
  // top-left rectangle (rows 0-1, cols 0-1) has values -10, -9, -9, -8 → sum < 0 → min = -10
  expect(result.z[0][0]).toBe(-10);
  // bottom-right rectangle (rows 6-7, cols 6-7) has values 2, 3, 3, 4 → sum > 0 → max = 4
  expect(result.z[3][3]).toBe(4);
});

test('keeps original from/to when no range is specified', () => {
  const size = 11;
  const z: Float64Array[] = [];
  for (let row = 0; row < size; row++) {
    const rowData = new Float64Array(size);
    for (let col = 0; col < size; col++) {
      rowData[col] = col + row;
    }
    z.push(rowData);
  }

  const data = {
    minX: 100,
    maxX: 200,
    minY: 300,
    maxY: 400,
    minZ: 0,
    maxZ: 20,
    z,
  };

  const result = reduce2DSpectrum(data, { numberOfPoints: 4 });

  expect(result.minX).toBe(100);
  expect(result.maxX).toBe(200);
  expect(result.minY).toBe(300);
  expect(result.maxY).toBe(400);
});

test('returns original data when numberOfPoints is larger than matrix size', () => {
  const size = 4;
  const z: Float64Array[] = [];
  for (let row = 0; row < size; row++) {
    const rowData = new Float64Array(size);
    for (let col = 0; col < size; col++) {
      rowData[col] = col + row;
    }
    z.push(rowData);
  }

  const data = {
    minX: 0,
    maxX: 30,
    minY: 0,
    maxY: 30,
    minZ: 0,
    maxZ: 6,
    z,
  };

  const result = reduce2DSpectrum(data, { numberOfPoints: 512 });

  expect(result).toBe(data);
});
