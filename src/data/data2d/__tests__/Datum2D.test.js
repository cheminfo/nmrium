import { readFileSync } from 'fs';
import { join } from 'path';

import { Data2DManager } from '../Data2DManager';

describe('Datum2D', () => {
  let jcamp = readFileSync(join(__dirname, './data/cosy.jdx'), 'utf8');
  let datum2D = Data2DManager.fromJcamp(jcamp, {
    display: {
      name: 'test',
      color: 'red',
      isVisible: true,
      isPeaksMarkersVisible: true,
    },
  });

  let contour = datum2D.getContourLines();

  console.log(contour);
  expect(true).toBe(true);
});
