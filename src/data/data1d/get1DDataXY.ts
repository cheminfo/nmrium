import { Datum1D } from '../types/data1d';

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

export default function get1DDataXY(spectrum: Datum1D): {
  x: number[];
  y: number[];
} {
  const {
    display: { isRealSpectrumVisible },
    data: { x, re, im },
  } = spectrum;

  return { x, y: isRealSpectrumVisible ? re : im };
}
