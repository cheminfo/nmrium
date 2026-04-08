import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xFindClosestIndex, xMedian } from 'ml-spectra-processing';

export function getMedianY(
  x: number,
  spectrum: Spectrum1D,
  windowSize = 41,
): number {
  const { info } = spectrum;
  const size = info.numberOfPoints ? info.numberOfPoints / 100 : windowSize;
  const { x: xValues, re: y } = spectrum.data;
  const halfWindow = Math.floor(size / 2);
  const centerIndex = xFindClosestIndex(xValues, x);
  const fromIndex = Math.max(0, centerIndex - halfWindow);
  const toIndex = Math.min(y.length, centerIndex + halfWindow + 1);
  const window = y.subarray(fromIndex, toIndex);
  return xMedian(window, { exact: false });
}
