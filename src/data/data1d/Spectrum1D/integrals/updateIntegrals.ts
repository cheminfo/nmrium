import { Datum1D } from '../../../types/data1d';

import { mapIntegrals } from './mapIntegrals';
import { updateIntegralsRelativeValues } from './updateIntegralsRelativeValues';

export function updateIntegrals(datum: Datum1D) {
  datum.integrals.values = mapIntegrals(
    datum.integrals.values,
    datum,
    'current',
  );
  updateIntegralsRelativeValues(datum, true);
}
