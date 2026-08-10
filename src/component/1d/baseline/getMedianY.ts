import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xFindClosestIndex, xMedian } from 'ml-spectra-processing';

import { getMedianWindow } from './getMedianWindow.ts';

function getMedianRange(x: number, spectrum: Spectrum1D) {
  const size = getMedianWindow(spectrum);
  const { x: xValues, re: y } = spectrum.data;
  const halfWindow = Math.floor(size / 2);
  const centerIndex = xFindClosestIndex(xValues, x);
  const fromIndex = Math.max(0, centerIndex - halfWindow);
  const toIndex = Math.min(y.length, centerIndex + halfWindow + 1);
  return { fromIndex, toIndex, from: xValues[fromIndex], to: xValues[toIndex] };

}



export function getMedianY(x: number, spectrum: Spectrum1D) {
  const { fromIndex, toIndex, from, to } = getMedianRange(x, spectrum);
  const { re: y } = spectrum.data;
  const window = y.subarray(fromIndex, toIndex);
  const median = xMedian(window, { exact: false });
  return { from, to, median };
}
