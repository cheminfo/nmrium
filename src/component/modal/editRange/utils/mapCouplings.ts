import type { Jcoupling } from '@zakodium/nmr-types';

import { hasCouplingConstant } from '../../../panels/extra/utilities/MultiplicityUtilities.js';

export function mapCouplings(couplings: Jcoupling[]) {
  return couplings
    .filter(
      ({ multiplicity }) => multiplicity && hasCouplingConstant(multiplicity),
    )
    .map((coupling) => structuredClone(coupling));
}
