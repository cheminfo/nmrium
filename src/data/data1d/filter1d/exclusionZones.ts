import { xySetYValue, zonesNormalize } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';

import { FilterDomainUpdateRules } from '../../FiltersManager';

export const id = 'exclusionZones';
export const name = 'Exclusion Zones';
export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: false,
  updateYDomain: false,
};

/**
 *
 * @param {Spectrum1D} spectrum
 */

export function apply(spectrum: Spectrum1D, zones = []) {
  if (!isApplicable(spectrum)) {
    throw new Error('Exclusion Zones filter not applicable on this data');
  }
  const { x, re, im } = spectrum.data;
  spectrum.data.re = Float64Array.from(xySetYValue({ x, y: re }, { zones }).y);
  spectrum.data.im = im
    ? Float64Array.from(xySetYValue({ x, y: re }, { zones }).y)
    : im;
}

export function isApplicable(spectrum: Spectrum1D) {
  if (spectrum.info.isFt) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: zonesNormalize(previousValue.concat(newValue)),
  };
}
