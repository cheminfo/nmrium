import { readFileSync } from 'fs';
import { join } from 'path';

import { autoPeakPicking, initiateDatum1D } from '../Spectrum1D';

describe('test peakPicking', () => {
  let data = JSON.parse(
    readFileSync(join(__dirname, './data/13c.json'), 'utf8'),
  );

  it('check baseline', () => {
    const datum = initiateDatum1D({ data });
    let peaks = autoPeakPicking(datum, {
      maxNumberOfPeaks: 20,
      minMaxRatio: 0.1,
    });
    expect(peaks).toHaveLength(20);
  });
});
