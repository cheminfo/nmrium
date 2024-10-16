import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { autoPeakPicking, initiateDatum1D } from '../Spectrum1D/index.js';

describe('test peakPicking', () => {
  const data = JSON.parse(
    readFileSync(path.join(__dirname, './data/13c.json'), 'utf8'),
  );
  it('check baseline', () => {
    const datum = initiateDatum1D({ data, info: { originFrequency: 150 } });
    const peaks = autoPeakPicking(datum, {
      maxNumberOfPeaks: 20,
      minMaxRatio: 0.1,
    });
    expect(peaks).toHaveLength(20);
  });
});
