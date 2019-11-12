import { readFileSync } from 'fs';
import { join } from 'path';

import autoPeakPicking from '../data1d/autoPeakPicking';

describe('test peakPicking', () => {
  let data = JSON.parse(
    readFileSync(join(__dirname, './data/13c.json'), 'utf8'),
  );

  it('check baseline', () => {
    let peaks = autoPeakPicking({ data });
    expect(peaks).toHaveLength(106);
  });
});
