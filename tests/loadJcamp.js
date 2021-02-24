import { readFileSync } from 'fs';
import { join } from 'path';

import { addJcamp } from '../src/data/SpectraManager';

let jcamp = readFileSync(
  join(__dirname, '../public/data/cytisine/2d/HMBC_Cytisin.dx'),
  'utf8',
);

addJcamp([], jcamp, {});
