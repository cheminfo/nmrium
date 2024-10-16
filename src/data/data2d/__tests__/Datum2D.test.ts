import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from 'vitest';

import { addJcamp } from '../../SpectraManager.js';
import { drawContours } from '../Spectrum2D/contours.js';

test('Datum2D', () => {
  const jcamp = readFileSync(path.join(__dirname, './data/cosy.jdx'), 'utf8');
  const spectra: any[] = [];

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

  const positive = drawContours(
    { contourLevels: [10, 100], numberOfLayers: 10 },
    spectra[0],
  );
  const negative = drawContours(
    { contourLevels: [10, 100], numberOfLayers: 10 },
    spectra[0],
    true,
  );
  expect(positive.contours).toHaveLength(10);
  expect(positive.timeout).toBeFalsy();
  expect(negative.contours).toHaveLength(10);
  expect(negative.timeout).toBeFalsy();
});
