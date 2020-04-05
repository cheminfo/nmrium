import { Analysis } from '../src/data/Analysis';
import { readFileSync } from 'fs';
import { join } from 'path';

let jcamp = readFileSync(
  join(__dirname, '../public/data/cytisine/2d/HMBC_Cytisin.dx'),
  'utf8',
);

let analysis = new Analysis();

analysis.addJcamp(jcamp);

console.log(analysis);
