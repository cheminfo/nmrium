import { resurrect } from 'nmr-processing';

import { UsedColors } from '../../../types/UsedColors';

import { generateSpectrumFromRanges } from './ranges/generateSpectrumFromRanges';

export function generateSpectrumFromPublicationString(
  publicationString: string,
  usedColors: UsedColors,
) {
  const {
    ranges,
    experiment: { nucleus, solvent },
    parts,
  } = resurrect(publicationString);

  if (ranges.length === 0) {
    throw new Error('there is not signals in the ACS string');
  }

  if (!nucleus) {
    throw new Error('nucleus does not exists in the ACS string');
  }

  return generateSpectrumFromRanges(
    ranges,
    { nucleus, solvent, name: parts[0] },
    usedColors,
  );
}
