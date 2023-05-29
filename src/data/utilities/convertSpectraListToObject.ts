import type { Spectrum1D, Spectrum2D } from 'nmr-processing';

export function convertSpectraArrayToObject<T extends Spectrum1D | Spectrum2D>(
  spectra: T[],
): Record<string, T> {
  const spectraObject = {};

  for (const spectrum of spectra) spectraObject[spectrum.id] = spectrum;

  return spectraObject;
}
