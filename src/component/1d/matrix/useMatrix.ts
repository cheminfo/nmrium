import type { Spectrum } from '@zakodium/nmrium-core';
import type { NumberArray } from 'cheminfo-types';
import { useMemo } from 'react';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import { useChartData } from '../../context/ChartContext.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';

/**
 * This method will slice the array from the fromIndex to the toIndex and add the first and last element of the original array
 * if needed
 * It will also add one extra point at the beginning or the end if the fromIndex or toIndex is not the first or the last point of the array
 *
 * @param array
 * @param options
 * @returns
 */
export function sliceArrayForDomain<T extends string[] | NumberArray>(
  array: T,
  options: {
    fromIndex: number;
    toIndex: number;
  },
): T {
  let { fromIndex, toIndex } = options;
  if (fromIndex > 0) fromIndex--;
  if (toIndex < array.length) toIndex++;
  // because slice does not include the last index we need to add one
  if (toIndex < array.length) toIndex++;
  if (fromIndex > 0 || toIndex < array.length) {
    return array.slice(fromIndex, toIndex) as T;
  }
  return array;
}

function getX(spectra: Spectrum[]) {
  const spectrum = spectra?.[0];

  if (!spectrum || !isSpectrum1D(spectrum)) return [];
  return spectrum.data.x;
}

export function useMatrix() {
  const { displayerMode } = useChartData();
  const spectra = useSpectraByActiveNucleus();
  return useMemo(() => {
    if (displayerMode !== '1D') return null;

    const matrixY: Float64Array[] = [];
    for (let i = 0; i < spectra.length; i++) {
      const spectrum = spectra[i];
      const filter = spectrum.filters.find(
        (filter) => filter.name === 'signalProcessing',
      );
      if (isSpectrum1D(spectrum) && filter?.enabled) {
        matrixY[i] = spectrum.data.re;
      }
    }

    if (matrixY.length === 0) return null;

    return {
      x: getX(spectra) || [],
      matrixY,
    };
  }, [displayerMode, spectra]);
}

interface InterpolateColorsPointsOptions {
  x: Float64Array | number[];
  y: number[];
  color: string[];
}

export function groupPointsByColor(data: InterpolateColorsPointsOptions) {
  const groups: Record<
    string,
    Array<{ x: number; y: number; endPath: boolean }>
  > = {};

  for (let i = 0; i < data.color.length - 1; i++) {
    const color = data.color[i];
    const x1 = data.x[i];
    const y1 = data.y[i];
    const nextColor = data.color[i + 1];
    const x2 = data.x[i + 1];
    const y2 = data.y[i + 1];

    // add the original point
    if (!groups[color]) groups[color] = [];
    groups[color].push({ x: x1, y: y1, endPath: false });

    // If the next point has a different color, add a segment with that color
    if (color !== nextColor) {
      // add the interpolated point
      const interpolatedX = (x1 + x2) / 2;
      const interpolatedY = (y1 + y2) / 2;
      groups[color].push({ x: interpolatedX, y: interpolatedY, endPath: true });
      if (!groups[nextColor]) groups[nextColor] = [];
      groups[nextColor].push({
        x: interpolatedX,
        y: interpolatedY,
        endPath: false,
      });
    }
  }

  // Add the last original point
  const lastIndex = data.x.length - 1;
  const lastColor = data.color[lastIndex];
  const lastX = data.x[lastIndex];
  const lastY = data.y[lastIndex];
  groups[lastColor].push({ x: lastX, y: lastY, endPath: true });

  return groups;
}
