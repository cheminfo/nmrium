import { Datum1D } from '../../../../types/data1d';

export function updateIntegralXShift(datum: Datum1D, shiftValue: number) {
  datum.integrals.values = datum.integrals.values.map((integral) => ({
    ...integral,
    from: integral.originFrom + shiftValue,
    to: integral.originTo + shiftValue,
  }));
}
