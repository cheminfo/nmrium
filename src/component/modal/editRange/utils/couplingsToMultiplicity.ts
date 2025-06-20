import type { Jcoupling } from '@zakodium/nmr-types';

export function couplingsToMultiplicity(couplings: Jcoupling[]) {
  return couplings.map(({ multiplicity }) => multiplicity).join('');
}
