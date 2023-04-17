/**
 * @typedef {Object} datum
 * @property {number[]} x - The X points series
 * @property {number[]} y - The Y points series
 */

import { Spectrum1D } from 'nmr-load-save';

/**
 *
 * @param spectrum 1d spectrum
 * @returns {datum} datum object includes x and y series
 */

export function get1DDataXY(spectrum: Spectrum1D): {
  x: Float64Array;
  y: Float64Array;
} {
  const {
    display: { isRealSpectrumVisible },
    data: { x, re, im },
  } = spectrum;

  return { x, y: isRealSpectrumVisible || !im ? re : im };
}
