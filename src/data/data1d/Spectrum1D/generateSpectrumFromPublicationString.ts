import type { Spectrum1D } from 'nmr-processing';
import { resurrect } from 'nmr-processing';

import { UsedColors } from '../../../types/UsedColors';

import { generateSpectrumFromRanges } from './ranges/generateSpectrumFromRanges';

export function generateSpectrumFromPublicationString(
  publicationString: string,
  usedColors: UsedColors,
): Spectrum1D {
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
