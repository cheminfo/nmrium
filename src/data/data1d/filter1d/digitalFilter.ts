import { Data1D, Spectrum1D } from 'nmr-load-save';

import { FilterDomainUpdateRules } from '../../FiltersManager';

export const id = 'digitalFilter';
export const name = 'Digital filter';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: true,
};

/**
 * Move points from the beginning to the end of FID and performs a first order phase correction
 * @param {Datum1d} spectrum
 */

export interface DigitalFilterOptions {
  digitalFilterValue?: number;
}

export function apply(
  spectrum: Spectrum1D,
  options: DigitalFilterOptions = {},
) {
  if (!isApplicable(spectrum)) {
    throw new Error('Digital Filter is not applicable on this data');
  }
  let { digitalFilterValue } = options;

  if (!digitalFilterValue) {
    digitalFilterValue = spectrum.info.digitalFilter || 0;
    const filter = spectrum.filters.find((filter) => filter.name === id);
    if (filter) {
      filter.value = { digitalFilterValue };
    }
  }

  let re = new Float64Array(spectrum.data.re);
  let im = new Float64Array(spectrum.data.im);

  let pointsToShift = Math.floor(digitalFilterValue);

  const skip = 0;
  pointsToShift += 0;

  const newRe = new Float64Array(re.length);
  const newIm = new Float64Array(im.length);
  newRe.set(re.slice(pointsToShift));
  newRe.set(re.slice(skip, pointsToShift), re.length - pointsToShift);
  newIm.set(im.slice(pointsToShift));
  newIm.set(im.slice(skip, pointsToShift), im.length - pointsToShift);

  spectrum.data.re = newRe;
  spectrum.data.im = newIm;
}

export function isApplicable(
  spectrum: Spectrum1D,
): spectrum is Spectrum1D & { data: Required<Data1D> } {
  if (spectrum.info.isComplex && spectrum.info.isFid) {
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
