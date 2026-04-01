import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { DoubleArray } from 'cheminfo-types';
import { xFindClosestIndex } from 'ml-spectra-processing';

export function getMedianY(
  x: number,
  spectrum: Spectrum1D,
  windowSize = 21,
): number {
  const { x: xValues, re: yValues } = spectrum.data;

  const centerIndex = xFindClosestIndex(xValues, x);
  const halfWindow = Math.floor(windowSize / 2);

  const fromIndex = Math.max(0, centerIndex - halfWindow);
  const toIndex = Math.min(xValues.length, centerIndex + halfWindow + 1);

  const yWindow = yValues.slice(fromIndex, toIndex);

  if (yWindow.length === 0) return 0;

  return getMedian(yWindow);
}

function getMedian(values: DoubleArray): number {
  const sorted = values.toSorted((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const isOdd = sorted.length % 2 !== 0;

  if (isOdd) {
    return sorted[mid];
  }

  return (sorted[mid - 1] + sorted[mid]) / 2;
}
