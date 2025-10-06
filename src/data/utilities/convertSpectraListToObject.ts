import type { Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';

export function convertSpectraArrayToObject<T extends Spectrum1D | Spectrum2D>(
  spectra: T[],
) {
  const spectraObject: Record<string, T> = {};

  for (const spectrum of spectra) spectraObject[spectrum.id] = spectrum;

  return spectraObject;
}
