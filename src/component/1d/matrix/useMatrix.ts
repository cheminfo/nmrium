import { Spectrum } from 'nmr-load-save';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import { useChartData } from '../../context/ChartContext';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';

interface MatrixColor {
  color: string;
  start: number;
  end: number;
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

  if (displayerMode !== '1D') return null;

  return {
    x: getX(spectra) || [],
    matrixY: spectra.map((spectrum) =>
      isSpectrum1D(spectrum) ? spectrum.data.re : [],
    ),
  };
}
