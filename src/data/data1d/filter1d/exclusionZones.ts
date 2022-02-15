import { xySetYValue, zonesNormalize } from 'ml-spectra-processing';
import { Datum1D } from './../../types/data1d/Datum1D';

export const id = 'exclusionZones';
export const name = 'Exclusion Zones';

/**
 *
 * @param {Datum1d} datum1d
 */

export function apply(datum1D: Datum1D, zones = []) {
  if (!isApplicable(datum1D)) {
    throw new Error('Exclusion Zones filter not applicable on this data');
  }
  const { x, re, im } = datum1D.data;
  datum1D.data.re = xySetYValue({ x, y: re }, { zones }).y as number[];
  datum1D.data.im = (im
    ? xySetYValue({ x, y: re }, { zones })
    : im) as unknown as number[];
}

export function isApplicable(datum1D: Datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFt) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: zonesNormalize(previousValue.concat(newValue)),
  };
}
