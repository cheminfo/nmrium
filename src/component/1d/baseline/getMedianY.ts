import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xFindClosestIndex, xMedian } from 'ml-spectra-processing';

import { getMedianWindow } from './getMedianWindow.ts';

export function getMedianY(x: number, spectrum: Spectrum1D): number {
  const size = getMedianWindow(spectrum);
  const { x: xValues, re: y } = spectrum.data;
  const halfWindow = Math.floor(size / 2);
  const centerIndex = xFindClosestIndex(xValues, x);
  const fromIndex = Math.max(0, centerIndex - halfWindow);
  const toIndex = Math.min(y.length, centerIndex + halfWindow + 1);
  const window = y.subarray(fromIndex, toIndex);
  return xMedian(window, { exact: false });
}
