import { Datum1D } from '../../types/data1d';
import { Datum2D } from '../../types/data2d';

export function isSpectrum2D(spectrum: Datum1D | Datum2D): spectrum is Datum2D {
  return spectrum.info.dimension === 2;
}
