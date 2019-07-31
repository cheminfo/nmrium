import { Datum1D } from '../Datum1D';
import {Data1DManager} from '../Data1DManager'
import { readFileSync } from 'fs';
import { join } from 'path';

describe('test Datum1D', () => {
  let jcamp = readFileSync(join(__dirname, './data/ethylbenzene-1h.jdx'), 'utf8');
  let v_data = Data1DManager.fromJcamp('1', jcamp, 'test', 'red', true,true);

  test('check x, re, im', () => {
    expect(v_data.data.x).toHaveLength(16384);
    expect(v_data.data.re).toHaveLength(16384);
    expect(v_data.data.im).toHaveLength(16384);
  });
});
