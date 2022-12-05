import { Datum1D } from '../types/data1d/Datum1D';
import { Datum2D } from '../types/data2d/Datum2D';

export function convertSpectraArrayToObject<T extends Datum1D | Datum2D>(
  spectra: T[],
): Record<string, T> {
  const spectraObject = {};

  for (const spectrum of spectra) spectraObject[spectrum.id] = spectrum;

  return spectraObject;
}
