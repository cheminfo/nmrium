import { readFileSync } from 'fs';
import { join } from 'path';

import autoPeakPicking from '../autoPeakPicking';

describe('test peakPicking', () => {
  let data = JSON.parse(
    readFileSync(join(__dirname, './data/13c.json'), 'utf8'),
  );

  test('check baseline', () => {
    let peaks = autoPeakPicking(data.x, data.re);
    expect(peaks.length).toBe(106);
  });
});
