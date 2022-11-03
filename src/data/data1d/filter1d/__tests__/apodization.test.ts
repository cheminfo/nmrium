import { describe, it, expect } from 'vitest';

import { apply } from '../apodization';

describe('lineBroadening', () => {
  it('simple x, re, im to 1 Hz exp.', () => {
    let spectrum = {
      data: {
        re: new Float64Array([1, 2, 3, 4]),
        im: new Float64Array([0, 0, 0, 0]),
        x: new Float64Array([10, 20, 30, 40]),
      },
      info: {
        isComplex: true,
        isFid: true,
      },
    };
    apply(spectrum, {
      lineBroadening: 0.1,
      gaussBroadening: 0,
      lineBroadeningCenter: 0,
    });

    expect(spectrum.data).toStrictEqual({
      re: new Float64Array([
        1, 0.08642783652754452, 0.0056023281951239675, 0.0003227980702812185,
      ]),
      im: new Float64Array([0, 0, 0, 0]),
      x: new Float64Array([10, 20, 30, 40]),
    });
  });
});
