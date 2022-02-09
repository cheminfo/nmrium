import { Datum2D } from '../../data/types/data2d';
import { Datum1D } from './../../data/types/data1d/Datum1D';
import nucleusToString from './nucleusToString';

export function getSpectraByNucleus(
  nucleus: string,
  data: (Datum1D | Datum2D)[],
) {
  return data.filter(
    (spectrum) => nucleusToString(spectrum.info.nucleus) == nucleus,
  );
}
