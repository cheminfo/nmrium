import type { Jcoupling } from 'nmr-processing';

export function couplingsToMultiplicity(couplings: Jcoupling[]) {
  return couplings.map(({ multiplicity }) => multiplicity).join('');
}
