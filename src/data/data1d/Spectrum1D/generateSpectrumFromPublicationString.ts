import { resurrect } from 'nmr-processing';

import { UsedColors } from '../../../types/UsedColors';
import { Datum1D } from '../../types/data1d';

import { generateSpectrumFromRanges } from './ranges/generateSpectrumFromRanges';

export function generateSpectrumFromPublicationString(
  publicationString: string,
  usedColors: UsedColors,
): Datum1D {
  const {
    ranges,
    experiment: { nucleus, solvent },
    parts,
  } = resurrect(publicationString);
  return generateSpectrumFromRanges(
    ranges,
    { nucleus, solvent, name: parts[0] },
    usedColors,
  );
}
