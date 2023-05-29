import type { Data1D, Spectrum1D } from 'nmr-processing';
import { apodization } from 'nmr-processing';

import { FilterDomainUpdateRules } from '../../FiltersManager';

export const id = 'apodization' as const;
export const name = 'Apodization';
export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: false,
};

/**
 *
 * @param {Spectrum1D} datum1d
 * @param {Object} [value]
 */

export interface ApodizationOptions {
  lineBroadening?: number;
  gaussBroadening?: number;
  lineBroadeningCenter?: number;
}

export const defaultApodizationOptions: ApodizationOptions = {
  lineBroadening: 1,
  gaussBroadening: 0,
  lineBroadeningCenter: 0,
};

export function apply(datum1D: Spectrum1D, options: ApodizationOptions = {}) {
  const {
    lineBroadening = 1,
    gaussBroadening = 0,
    lineBroadeningCenter = 0,
  } = options;

  // if no options is set, we add the default value to filter
  if (Object.keys(options).length === 0) {
    const filter = datum1D.filters.find((filter) => filter.name === id);
    if (filter) {
      filter.value = { lineBroadening, gaussBroadening, lineBroadeningCenter };
    }
  }
  const newData = apodizationFilter(datum1D, {
    lineBroadening,
    gaussBroadening,
    lineBroadeningCenter,
  });

  datum1D.data = {
    ...datum1D.data,
    re: newData.re as Float64Array,
    im: newData.im as Float64Array,
  };
}
export function isApplicable(datum1D: Spectrum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}

export function apodizationFilter(
  datum1D: Spectrum1D,
  options: ApodizationOptions = {},
) {
  const {
    lineBroadening = 1,
    gaussBroadening = 0,
    lineBroadeningCenter = 0,
  } = options;

  let grpdly = datum1D.info?.digitalFilter || 0;
  let pointsToShift;
  if (grpdly > 0) {
    pointsToShift = Math.floor(grpdly);
  } else {
    pointsToShift = 0;
  }

  const data = datum1D.data as Required<Data1D>;

  const re = data.re;
  const im = data.im;
  const t = data.x;

  const length = re.length;
  const dw = (t[length - 1] - t[0]) / (length - 1); //REPLACE CONSTANT with calculated value... : for this we need AQ or DW to set it right...

  return apodization(
    { re, im },
    {
      pointsToShift,
      compose: {
        length,
        shapes: [
          {
            start: 0,
            shape: {
              kind: 'lorentzToGauss',
              options: {
                length,
                dw,
                exponentialHz:
                  gaussBroadening > 0 ? lineBroadening : -lineBroadening,
                gaussianHz: gaussBroadening,
                center: lineBroadeningCenter,
              },
            },
          },
        ],
      },
    },
  );
}
