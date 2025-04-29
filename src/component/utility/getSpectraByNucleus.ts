import type { Spectrum } from '@zakodium/nmrium-core';

import nucleusToString from './nucleusToString.js';

export function getSpectraByNucleus(nucleus: string, data: Spectrum[]) {
  return data.filter(
    (spectrum) => nucleusToString(spectrum.info.nucleus) === nucleus,
  );
}
