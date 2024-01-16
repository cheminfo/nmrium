import { describe, it, expect } from 'vitest';
import { FromTo } from 'cheminfo-types';

import getFromToFromX from '../getFromToFromX';

describe('getFromToFromX', () => {
  it('single zone', () => {
    const x = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const zones = getFromToFromX(x);
    expect(zones).toStrictEqual([{ from: 1, to: 10 }] as FromTo[]);
  });
  it('two zones', () => {
    const x = new Float64Array([1, 2, 3, 4, 6, 7, 8, 9, 10]);
    const zones = getFromToFromX(x);
    expect(zones).toStrictEqual([
      { from: 1, to: 4 },
      { from: 6, to: 10 },
    ] as FromTo[]);
  });
  it('three zones, single right', () => {
    const x = new Float64Array([
      1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 19,
    ]);
    const zones = getFromToFromX(x);
    expect(zones).toStrictEqual([
      { from: 1, to: 4 },
      { from: 6, to: 15 },
      { from: 19, to: 19 },
    ] as FromTo[]);
  });
  it('three zones, single middle', () => {
    const x = new Float64Array([1, 2, 3, 5, 7, 8, 9, 10]);
    const zones = getFromToFromX(x);
    expect(zones).toStrictEqual([
      { from: 1, to: 3 },
      { from: 5, to: 5 },
      { from: 7, to: 10 },
    ] as FromTo[]);
  });
  it('non uniform x', () => {
    const x = new Float64Array([1, 2, 4, 6, 8, 11, 14, 16, 19, 22, 25, 27, 31]);
    const zones = getFromToFromX(x);
    expect(zones).toStrictEqual([{ from: 1, to: 31 }] as FromTo[]);
  });
});
