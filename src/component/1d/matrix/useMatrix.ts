import { NumberArray } from 'cheminfo-types';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { Spectrum } from 'nmr-load-save';
import { useMemo } from 'react';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import { useChartData } from '../../context/ChartContext';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';

interface MatrixColor {
  color: string;
  start: number;
  end: number;
}

export function findXFromToIndex(x, options: { from: number; to: number }) {
  const { from, to } = options;
  let fromIndex = xFindClosestIndex(x, from);
  let toIndex = xFindClosestIndex(x, to);

  if (fromIndex > 0) {
    for (let i = fromIndex; i >= 0; i--) {
      if (x[i] <= from) {
        fromIndex = i;
        break;
      }
    }
  }
  if (toIndex < x.length) {
    for (let i = toIndex; i < x.length; i++) {
      if (x[i] >= to) {
        toIndex = i;
        break;
      }
    }
  }
  return { fromIndex, toIndex };
}

export function sliceArray(
  array: number[] | Float64Array | NumberArray,
  options: {
    fromIndex: number;
    toIndex: number;
  },
) {
  const { fromIndex, toIndex } = options;
  const resultLength = toIndex - fromIndex + 2;
  const result = new Array(resultLength);
  result[0] = array[0];
  for (let i = 0; i < toIndex - fromIndex; i++) {
    result[i + 1] = array[fromIndex + i];
  }
  result[resultLength - 1] = array.at(-1);

  return result;
}

export function interpolateNumber(
  inputRange: [number, number],
  outputRange: [number, number],
) {
  return (value) =>
    outputRange[0] +
    ((value - inputRange[0]) * (outputRange[1] - outputRange[0])) /
      (inputRange[1] - inputRange[0]);
}

export function mapMatrixColors(colors) {
  if (colors.length === 0) return [];

  const result: MatrixColor[] = [];
  let start = 0;

  for (let i = 1; i <= colors.length; i++) {
    if (colors[i] !== colors[start]) {
      result.push({ color: colors[start], start, end: i - 1 });
      start = i;
    }
  }

  return result;
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
    return {
      x: getX(spectra) || [],
      matrixY: spectra.map((spectrum) =>
        isSpectrum1D(spectrum) ? spectrum.data.re : [],
      ),
    };
  }, [displayerMode, spectra]);
}

interface InterpolateColorsPointsOptions {
  x: Float64Array | number[];
  y: number[];
  color: string[];
}

export function interpolatedColorsPoints(data: InterpolateColorsPointsOptions) {
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
