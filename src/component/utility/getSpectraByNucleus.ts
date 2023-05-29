import type { Spectrum } from 'nmr-processing';

import nucleusToString from './nucleusToString';

export function getSpectraByNucleus(nucleus: string, data: Spectrum[]) {
  return data.filter(
    (spectrum) => nucleusToString(spectrum.info.nucleus) === nucleus,
  );
}
