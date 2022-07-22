import { Datum1D } from '../../types/data1d';

import { apply as applyApodization } from './apodization';
import { apply as applyZeroFilling } from './zeroFilling';

export const id = 'zeroFillingAndApodization';
export const name = 'Apodization and zero filling';

export function apply(datum1D: Datum1D, options) {
  if (!isApplicable(datum1D)) {
    throw new Error('lineBroadening not applicable on this data');
  }

  const { apodization, zeroFilling } = options;
  applyApodization(datum1D, apodization);

  const { size } = zeroFilling;
  applyZeroFilling(datum1D, size);
}

export function isApplicable(datum1D: Datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}
