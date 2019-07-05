import { Data1D } from '../Data1D';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('test Data1D', () => {
  let jcamp = readFileSync(join(__dirname, './ethylbenzene-1h.jdx'), 'utf8');
  let data = Data1D.fromJcamp(jcamp);

  test('check x, re, im', () => {
    expect(data.x).toHaveLength(16384);
    expect(data.re).toHaveLength(16384);
    expect(data.im).toHaveLength(16384);
  });
});
