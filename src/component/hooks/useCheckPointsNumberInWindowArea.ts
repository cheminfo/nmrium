import { xGetFromToIndex } from 'ml-spectra-processing';
import type { Spectrum } from 'nmr-correlation';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.ts';
import { useChartData } from '../context/ChartContext.js';

import { useSelectedSpectra } from './useSelectedSpectra.ts';
import useSpectraByActiveNucleus from './useSpectraPerNucleus.ts';
import useSpectrum from './useSpectrum.ts';

export const MIN_AREA_POINTS = 5;

function checkPointNumberInWindowArea(
  spectra: Spectrum | Spectrum[],
  from: number,
  to: number,
) {
  const spectraArray = Array.isArray(spectra) ? spectra : [spectra];
  const filteredSpectra = spectraArray.filter(isSpectrum1D);

  if (filteredSpectra.length === 0) {
    return false;
  }

  return filteredSpectra.every((spectrum) => {
    const { fromIndex, toIndex } = xGetFromToIndex(spectrum.data.x, {
      from,
      to,
    });
    return toIndex - fromIndex > MIN_AREA_POINTS;
  });
}

export function useCheckPointsNumberInWindowArea() {
  const state = useChartData();
  const spectrum = useSpectrum(null);
  const {
    xDomain: [from, to],
  } = state;

  return checkPointNumberInWindowArea(spectrum, from, to);
}

export function useCheckPointsNumberInSelectedSpectra() {
  const state = useChartData();
  const spectra = useSelectedSpectra();
  const spectraByActiveNucleus = useSpectraByActiveNucleus();
  const {
    xDomain: [from, to],
  } = state;

  return checkPointNumberInWindowArea(
    spectra ?? spectraByActiveNucleus,
    from,
    to,
  );
}
