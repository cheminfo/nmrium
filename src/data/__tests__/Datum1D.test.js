import { readFileSync } from 'fs';
import { join } from 'path';

import { Data1DManager } from '../data1d/Data1DManager';

describe('test Datum1D', () => {
  let jcamp = readFileSync(
    join(__dirname, './data/ethylbenzene-1h.jdx'),
    'utf8',
  );
  let data = Data1DManager.fromJcamp(jcamp, {
    display: {
      name: 'test',
      color: 'red',
      isVisible: true,
      isPeaksMarkersVisible: true,
    },
  });

  it('check x, re, im', () => {
    expect(data.data.x).toHaveLength(16384);
    expect(data.data.re).toHaveLength(16384);
    expect(data.data.im).toHaveLength(16384);
  });
});
