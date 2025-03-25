import type { Range } from 'nmr-processing';

import { couplingsToMultiplicity } from './couplingsToMultiplicity.js';
import { mapCouplings } from './mapCouplings.js';

export function mapRange(range: Range) {
  if (!Array.isArray(range.signals)) return range;

  const signals = range.signals.map((signal) => {
    const {
      id,
      js: couplings = [],
      multiplicity,
      peaks,
      ...otherSignalProps
    } = signal;
    const js = mapCouplings(couplings);

    return {
      id: id || crypto.randomUUID(),
      js,
      ...otherSignalProps,
      multiplicity: couplingsToMultiplicity(couplings),
      peaks: peaks?.map((peak) => ({ ...peak })) || [],
    };
  });
  return { ...range, signals };
}
