import { Datum1D } from '../Datum1D';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('test Datum1D', () => {
  let jcamp = readFileSync(join(__dirname, './ethylbenzene-1h.jdx'), 'utf8');
  let data = Datum1D.fromJcamp("1",jcamp,"test","red",true);

  test('check x, re, im', () => {
    expect(data.x).toHaveLength(16384);
    expect(data.re).toHaveLength(16384);
    expect(data.im).toHaveLength(16384);
  });
});
