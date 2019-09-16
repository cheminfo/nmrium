import { readFileSync } from 'fs';
import { join } from 'path';

import { Datum1D } from '../data1d/Datum1D';
import { Data1DManager } from '../data1d/Data1DManager';

describe('test Datum1D', () => {
  let jcamp = readFileSync(
    join(__dirname, './data/ethylbenzene-1h.jdx'),
    'utf8',
  );
  let data = Data1DManager.fromJcamp(jcamp, { name: 'test', color: 'red' });

  it('check x, re, im', () => {
    expect(data.x).toHaveLength(16384);
    expect(data.re).toHaveLength(16384);
    expect(data.im).toHaveLength(16384);
  });
});
