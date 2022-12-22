import * as Filters from 'ml-signal-processing';

import { Datum1D } from '../../types/data1d/Datum1D';
import { MatrixOptions } from '../../types/view-state/MatrixViewState';

export const id = 'signalProcessing';
export const name = 'Signal processing';

/**
 *
 * @param {Datum1d} datum1d
 * @param {MatrixOptions} options
 */

export function apply(datum1D: Datum1D, options: MatrixOptions) {
  if (!isApplicable(datum1D)) {
    throw new Error('Signal Processing is not applicable on this data');
  }

  datum1D.data = filterXY(datum1D, options);
}
export function isApplicable(datum1D: Datum1D) {
  if (datum1D.info.isFt) return true;
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
export function filterXY(datum1D: Datum1D, options: MatrixOptions) {
  let x = datum1D.data.x.slice(0);
  let cloneX = datum1D.data.x.slice(0);
  let re = datum1D.data.re.slice(0);
  let im = datum1D.data.im?.slice(0);

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
