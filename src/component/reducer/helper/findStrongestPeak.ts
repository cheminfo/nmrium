import { NmrData1D } from 'cheminfo-types';
import { xFindClosestIndex } from 'ml-spectra-processing';

import { maxAbsoluteValue } from '../../utility/maxAbsoluteValue.js';

export function findStrongestPeak(data: NmrData1D) {
  if (!data) return null;

  const maxY = maxAbsoluteValue(data.re);
  const index = xFindClosestIndex(data.re, maxY, { sorted: false });
  return {
    xValue: data.x[index],
    yValue: maxY,
    index,
  };
}
