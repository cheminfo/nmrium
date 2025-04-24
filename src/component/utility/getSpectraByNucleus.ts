import type { Spectrum } from 'nmrium-core';

import nucleusToString from './nucleusToString.js';

export function getSpectraByNucleus(nucleus: string, data: Spectrum[]) {
  return data.filter(
    (spectrum) => nucleusToString(spectrum.info.nucleus) === nucleus,
  );
}
