import { describe, it, expect } from 'vitest';

import { apply } from '../fft';
import { signalsToFID } from 'nmr-processing';

describe('lineBroadening', () => {
  it('simple x, re, im to 1 Hz exp.', () => {
    const nbPoints = 128;
    const frequencyOffset = 2000;
    const originFrequency = 400;
    const baseFrequency = originFrequency - frequencyOffset / 1e6;
    const fid = signalsToFID([{ delta: 4, js: [], atoms: [1] }], {
      from: 0,
      to: 10,
      nbPoints: nbPoints - 2,
      frequency: originFrequency,
    });
    let spectrum = {
      data: {
        ...fid,
        x: new Float64Array(fid.re.length),
      },
      info: {
        aqMod: 1,
        isComplex: true,
        isFid: true,
        spectralWidth: 10,
        frequencyOffset,
        baseFrequency,
      },
      filters: [],
    };
    apply(spectrum);
    const { data } = spectrum;
    expect(data.re).toHaveLength(nbPoints); //next power of two
    expect(data.x[0]).toBeCloseTo(0, 1);
    expect(data.x[nbPoints - 1]).toBeCloseTo(10, 1);
  });
});
