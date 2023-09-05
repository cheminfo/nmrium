import { test, expect } from 'vitest';

import { calculateDerivedProperties } from '../calculateDerivedProperties';

test('deriveProps', () => {
  const data = {
    name: 'John',
    originalX: 30,
    data: {
      originalX: [1, 2, 3],
      y: [2, 3, 4],
    },
    ranges: [
      {
        originalFrom: 1,
        originalTo: 2,
      },
      {
        originalFrom: 3,
        originalTo: 4,
      },
    ],
  };

  // In this mapping we ignore the arrays indices
  const mapping = {
    'ranges.originalFrom': 'from',
    'ranges.originalTo': 'to',
    'data.originalX': 'x',
    originalX: 'x',
  };

  const shift = 2;
  calculateDerivedProperties(data, mapping, (value) => value + shift);

  expect(data).toStrictEqual({
    name: 'John',
    originalX: 30,
    data: { originalX: [1, 2, 3], y: [2, 3, 4], x: [3, 4, 5] },
    ranges: [
      { originalFrom: 1, originalTo: 2, from: 3, to: 4 },
      { originalFrom: 3, originalTo: 4, from: 5, to: 6 },
    ],
    x: 32,
  });
});
