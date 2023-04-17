import { Spectrum } from 'nmr-load-save';

import nucleusToString from './nucleusToString';

export function getSpectraByNucleus(nucleus: string, data: Spectrum[]) {
  return data.filter(
    (spectrum) => nucleusToString(spectrum.info.nucleus) === nucleus,
  );
}
