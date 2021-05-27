import { readFileSync } from 'fs';
import { join } from 'path';

import { addJcamp } from '../../SpectraManager';

test('Datum2D', () => {
  const jcamp = readFileSync(join(__dirname, './data/cosy.jdx'), 'utf8');
  const spectra = [];

  addJcamp(
    spectra,
    jcamp,
    {
      display: {
        name: 'test',
        isVisible: true,
      },
      source: {
        jcampURL: null,
      },
    },
    [],
  );
  const { positive, negative } = spectra[0].processingController.drawContours();
  expect(positive).toHaveLength(10);
  expect(negative).toHaveLength(10);
});
