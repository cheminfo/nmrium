import type { Signal1D } from 'nmr-processing';

import { couplingsToMultiplicity } from './couplingsToMultiplicity.js';
import { mapCouplings } from './mapCouplings.js';

export function mapSignals(signals?: Signal1D[]) {
  if (!Array.isArray(signals)) return [];

  return signals.map((signal) => {
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
}
