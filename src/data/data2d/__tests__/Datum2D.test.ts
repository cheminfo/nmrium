import { readFileSync } from 'node:fs';
import path from 'node:path';

import { test, expect } from 'vitest';

import { addJcamp } from '../../SpectraManager';
import { drawContours } from '../Spectrum2D/contours';
import { calculateSanPlot } from '../../utilities/calculateSanPlot';

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
  const noise = calculateSanPlot('2D', spectra[0]).positive;
  const positive = drawContours(10, noise, spectra[0]);
  const negative = drawContours(10, noise, spectra[0], true);
  expect(positive.contours).toHaveLength(10);
  expect(positive.timeout).toBeFalsy();
  expect(negative.contours).toHaveLength(10);
  expect(negative.timeout).toBeFalsy();
});
