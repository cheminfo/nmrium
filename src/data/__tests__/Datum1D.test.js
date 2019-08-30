import { Datum1D } from '../Datum1D';
import {Data1DManager} from '../Data1DManager'
import { readFileSync } from 'fs';
import { join } from 'path';

describe('test Datum1D', () => {
  let jcamp = readFileSync(join(__dirname, './data/ethylbenzene-1h.jdx'), 'utf8');
  let data = Data1DManager.fromJcamp( jcamp, {name:'test', color:'red'});

  test('check x, re, im', () => {
    expect(data.x).toHaveLength(16384);
    expect(data.re).toHaveLength(16384);
    expect(data.im).toHaveLength(16384);
  });
});
