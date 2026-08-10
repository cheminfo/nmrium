import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xFindClosestIndex, xMedian } from 'ml-spectra-processing';

import { getMedianWindow } from './getMedianWindow.ts';

function getMedianRange(x: number, spectrum: Spectrum1D) {
  const size = getMedianWindow(spectrum);
  const { x: xValues, re: y } = spectrum.data;
  const halfWindow = Math.floor(size / 2);
  const centerIndex = xFindClosestIndex(xValues, x);
  const lastIndex = y.length - 1;

  const distanceToEnd = lastIndex - centerIndex;

  const symmetricHalfWindow = Math.min(halfWindow, centerIndex, distanceToEnd);

  const fromIndex = centerIndex - symmetricHalfWindow;
  const toIndex = centerIndex + symmetricHalfWindow;
  return {
    fromIndex,
    toIndex,
    from: xValues[fromIndex],
    to: xValues[toIndex],
  };
}

export function getMedianY(x: number, spectrum: Spectrum1D) {
  const { fromIndex, toIndex, from, to } = getMedianRange(x, spectrum);
  const { re: y } = spectrum.data;
  const window = y.subarray(fromIndex, toIndex + 1);
  const median = xMedian(window, { exact: false });
  return { from, to, median };
}
