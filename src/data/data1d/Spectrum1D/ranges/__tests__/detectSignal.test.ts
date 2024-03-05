import { rangesToXY } from 'nmr-processing';
import { describe, it, expect } from 'vitest';

import detectSignals from '../detectSignals';

describe('lineBroadening', () => {
  it('simple x, re, im to 1 Hz exp.', () => {
    const from = 0.98;
    const to = 1.02;
    const frequency = 400;
    const { x, y } = rangesToXY(
      [
        {
          from,
          to,
          signals: [
            {
              delta: 1,
              multiplicity: 't',
              js: [{ coupling: 7.2, multiplicity: 't' }],
            },
          ],
        },
      ],
      { from: from - 0.02, to: to + 0.02, nbPoints: 512, frequency },
    );
    const result = detectSignals(
      { x: new Float64Array(x), y },
      { from, to, frequency, nucleus: '1H' },
    )[0];
    expect(result?.multiplicity).toBe('t');
    expect(result?.delta).toBeCloseTo(1, 3);
    expect(result?.js[0].coupling).toBeCloseTo(7.2, 2);
  });
});
