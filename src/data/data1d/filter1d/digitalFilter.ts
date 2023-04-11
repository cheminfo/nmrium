import { FilterDomainUpdateRules } from '../../FiltersManager';
import { Data1D } from '../../types/data1d/Data1D';
import { Datum1D } from '../../types/data1d/Datum1D';

export const id = 'digitalFilter';
export const name = 'Digital Filter';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: true,
};

/**
 * Move points from the beginning to the end of FID and performs a first order phase correction
 * @param {Datum1d} datum1d
 */

export interface DigitalFilterOptions {
  digitalFilterValue?: number;
}

export function apply(datum1D: Datum1D, options: DigitalFilterOptions = {}) {
  if (!isApplicable(datum1D)) {
    throw new Error('Digital Filter is not applicable on this data');
  }
  let { digitalFilterValue } = options;

  if (!digitalFilterValue) {
    digitalFilterValue = datum1D.info.digitalFilter || 0;
    const filter = datum1D.filters.find((filter) => filter.name === id);
    if (filter) {
      filter.value = { digitalFilterValue };
    }
  }

  let re = new Float64Array(datum1D.data.re);
  let im = new Float64Array(datum1D.data.im);

  let pointsToShift = Math.floor(digitalFilterValue);

  const skip = 0;
  pointsToShift += 0;

  const newRe = new Float64Array(re.length);
  const newIm = new Float64Array(im.length);
  newRe.set(re.slice(pointsToShift));
  newRe.set(re.slice(skip, pointsToShift), re.length - pointsToShift);
  newIm.set(im.slice(pointsToShift));
  newIm.set(im.slice(skip, pointsToShift), im.length - pointsToShift);

  datum1D.data.re = newRe;
  datum1D.data.im = newIm;
}

export function isApplicable(
  datum1D: Datum1D,
): datum1D is Datum1D & { data: Required<Data1D> } {
  if (datum1D.info.isComplex && datum1D.info.isFid) {
    return true;
  }
  return false;
}

export function reduce() {
  return {
    once: true,
    reduce: undefined,
  };
}
