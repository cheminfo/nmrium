import * as Filters from 'ml-signal-processing';
import type { Spectrum1D } from 'nmr-processing';

import { FilterDomainUpdateRules } from '../../FiltersManager';
import { MatrixOptions } from '../../types/data1d/MatrixOptions';

export const id = 'signalProcessing';
export const name = 'Signal processing';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: true,
};

/**
 *
 * @param {Spectrum1D} spectrum
 * @param {MatrixOptions} options
 */

export function apply(spectrum: Spectrum1D, options: MatrixOptions) {
  if (!isApplicable(spectrum)) {
    throw new Error('Signal Processing is not applicable on this data');
  }

  spectrum.data = filterXY(spectrum, options);
}
export function isApplicable(spectrum: Spectrum1D) {
  if (spectrum.info.isFt) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}

/**
 * Apply filters on {x:[], y:[]}
 * @returns A very important number
 */
export function filterXY(spectrum: Spectrum1D, options: MatrixOptions) {
  let x = spectrum.data.x.slice(0);
  let cloneX = spectrum.data.x.slice(0);
  let re = spectrum.data.re.slice(0);
  let im = spectrum.data.im?.slice(0);

  const filters = options.filters.slice();

  const {
    range: { from, to },
    numberOfPoints,
    exclusionsZones: exclusions,
  } = options;

  filters.push({
    name: 'equallySpaced',
    options: { from, to, numberOfPoints, exclusions },
    properties: {},
  });

  for (const filter of filters) {
    // eslint-disable-next-line import/namespace
    const filterFunction = Filters[filter.name];
    if (!filterFunction) {
      throw new Error(`Unknown filter: ${filter.name}`);
    }

    const filterOptions = filter?.options || {};

    // @ts-expect-error some method have options and some other ones don't have any options
    const realResult = filterFunction({ x, y: re }, filterOptions);
    x = realResult.data.x as Float64Array;
    re = realResult.data.y as Float64Array;

    if (im) {
      const imaginaryResult = filterFunction(
        { x: cloneX, y: im },
        // @ts-expect-error some method have options and some other ones don't have any options
        filterOptions,
      );
      im = imaginaryResult.data.y as Float64Array;
    }
  }

  return { x, re, im };
}
