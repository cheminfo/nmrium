import { readFileSync } from 'node:fs';
import path from 'node:path';

import { addJcamp } from '../../SpectraManager';

describe('test Datum1D', () => {
  const jcamp = readFileSync(
    path.join(__dirname, './data/ethylbenzene-1h.jdx'),
    'utf8',
  );
  const spectra: any[] = [];

  addJcamp(
    spectra,
    jcamp,
    {
      display: {
        name: 'test',
        color: 'red',
        isVisible: true,
        isPeaksMarkersVisible: true,
      },
      source: {
        jcampURL: null,
      },
    },
    [],
  );

  it('check x, re, im', () => {
    expect(spectra[0].data.x).toHaveLength(16384);
    expect(spectra[0].data.re).toHaveLength(16384);
    expect(spectra[0].data.im).toHaveLength(16384);
  });
});
