import { Datum1D } from '../../types/data1d';
import { isComplexData1D } from '../../utilities/isComplexData1D';

/**
 * @typedef {Object} datum
 * @property {number[]} x - The X points series
 * @property {number[]} y - The Y points series
 */

/**
 *
 * @param spectrum 1d spectrum
 * @returns {datum} datum object includes x and y series
 */

export function get1DDataXY(spectrum: Datum1D): {
  x: Float64Array;
  y: Float64Array;
} {
  isComplexData1D(spectrum.data);

  const {
    display: { isRealSpectrumVisible },
    data: { x, re, im },
  } = spectrum;

  return { x, y: isRealSpectrumVisible ? re : im };
}
