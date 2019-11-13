import { readFileSync } from 'fs';
import { join } from 'path';

import autoPeakPicking from '../data1d/autoPeakPicking';

describe('test peakPicking', () => {
  let data = JSON.parse(
    readFileSync(join(__dirname, './data/13c.json'), 'utf8'),
  );

  it('check baseline', () => {
    let peaks = autoPeakPicking(
      { data },
      { maxNumberOfPeaks: 20, minMaxRatio: 0.1 },
    );
    expect(peaks).toHaveLength(20);
  });
});
