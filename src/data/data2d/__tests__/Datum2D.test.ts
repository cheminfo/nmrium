import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { BasicContour } from 'ml-conrec/lib/BasicContourDrawer';
import { test, expect } from 'vitest';

import { addJcamp } from '../../SpectraManager.js';
import { drawContours } from '../Spectrum2D/contours.js';

test('Datum2D', () => {
  const jcamp = readFileSync(path.join(__dirname, './data/cosy.jdx'), 'utf8');
  const spectra: any[] = [];
  const cache = new Map<number, BasicContour>();

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
    spectra[0],
    { contourLevels: [10, 100], numberOfLayers: 10 },
    { cache },
  );
  const negative = drawContours(
    spectra[0],
    { contourLevels: [10, 100], numberOfLayers: 10 },
    { cache, negative: true },
  );
  expect(positive.contours).toHaveLength(10);
  expect(positive.timeout).toBeFalsy();
  expect(negative.contours).toHaveLength(10);
  expect(negative.timeout).toBeFalsy();
});
