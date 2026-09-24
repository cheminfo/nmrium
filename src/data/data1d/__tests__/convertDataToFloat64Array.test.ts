import type { NmrData1D } from 'cheminfo-types';
import { expect, test } from 'vitest';

import { convertDataToFloat64Array } from '../Spectrum1D/convertDataToFloat64Array.js';

// `convertDataToFloat64Array` is here to convert the number arrays of legacy
// data to `Float64Array`, the input is not a valid `NmrData1D` yet.
const asData = (data: unknown) => data as NmrData1D;

test('convert x and re to Float64Array', () => {
  const actual = convertDataToFloat64Array(
    asData({
      x: [1, 2, 3],
      re: [4, 5, 6],
    }),
  );

  expect(actual).not.haveOwnProperty('im');
  expect(actual.x).toStrictEqual(Float64Array.of(1, 2, 3));
  expect(actual.re).toStrictEqual(Float64Array.of(4, 5, 6));
});

test('keep im as Float64Array when defined', () => {
  const actual = convertDataToFloat64Array(
    asData({
      x: [1, 2, 3],
      re: [4, 5, 6],
      im: [7, 8, 9],
    }),
  );

  expect(actual.im).toStrictEqual(Float64Array.of(7, 8, 9));
});

test.each([
  ['empty array', []],
  ['empty Float64Array', Float64Array.from([])],
])('data could be empty', (_label, data) => {
  const actual = convertDataToFloat64Array(
    asData({
      x: data,
      re: data,
      im: data,
    }),
  );

  // An empty `Float64Array` is truthy and would be treated as some imaginary
  // data by the consumers.
  expect(actual.im).toBeInstanceOf(Float64Array);
  expect(actual.x).toBeInstanceOf(Float64Array);
  expect(actual.re).toBeInstanceOf(Float64Array);
});