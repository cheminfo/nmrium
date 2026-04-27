import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Spectrum2D } from '@zakodium/nmrium-core';
import { init } from '@zakodium/nmrium-core-plugins';
import type { NmrData2DFt } from 'cheminfo-types';
import { FileCollection } from 'file-collection';
import { expect, test } from 'vitest';

import { drawContours } from '../Spectrum2D/contours.js';

test('Datum2D', async () => {
  const core = init();
  const fc = new FileCollection();
  const jcamp = await readFile(path.join(__dirname, './data/cosy.jdx'), 'utf8');
  await fc.appendText('cosy.jdx', jcamp);
  const {
    state: { data },
  } = await core.read(fc);
  const spectrum = data?.spectra?.[0] as Spectrum2D;

  const positive = drawContours(
    { contourLevels: [10, 100], numberOfLayers: 10 },
    {
      data: (spectrum.data as NmrData2DFt).rr,
      display: spectrum.display,
      id: '',
    },
  );
  const negative = drawContours(
    { contourLevels: [10, 100], numberOfLayers: 10 },
    {
      data: (spectrum.data as NmrData2DFt).rr,
      display: spectrum.display,
      id: '',
    },
    true,
  );
  expect(positive.contours).toHaveLength(10);
  expect(positive.timeout).toBeFalsy();
  expect(negative.contours).toHaveLength(10);
  expect(negative.timeout).toBeFalsy();
});
