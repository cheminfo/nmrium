import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Spectrum1D } from '@zakodium/nmrium-core';
import { init } from '@zakodium/nmrium-core-plugins';
import { FileCollection } from 'file-collection';
import { describe, expect, it } from 'vitest';

describe('test Datum1D', async () => {
  const core = init();
  const fc = new FileCollection();
  const jcamp = await readFile(
    path.join(__dirname, './data/ethylbenzene-1h.jdx'),
    'utf8',
  );
  await fc.appendText('ethylbenzene-1h.jdx', jcamp);
  const {
    state: { data },
  } = await core.read(fc);
  const spectrum = data?.spectra?.[0] as Spectrum1D;

  it('check x, re, im', () => {
    expect(spectrum.data.x).toHaveLength(16384);
    expect(spectrum.data.re).toHaveLength(16384);
    expect(spectrum.data.im).toHaveLength(16384);
  });
});
