import { reimFFT, reimPhaseCorrection } from 'ml-spectra-processing';

import { Data1D } from '../../types/data1d';
import { Datum1D } from '../../types/data1d/Datum1D';

import { padDataToNextPowerOfTwo } from './utils/padDataToNextPowerOfTwo';

export const id = 'fft';
export const name = 'FFT';

/**
 *
 * @param {Datum1d} datum1d
 */

export function apply(datum1D: Datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('fft not applicable on this data');
  }

  let digitalFilterApplied = datum1D.filters.some(
    (e) => e.name === 'digitalFilter' && e.flag,
  );

  if (!hasSameLength(datum1D.data)) {
    throw new Error('The length of data should be equal');
  } else if (!isPowerOfTwo(datum1D.data.x.length)) {
    padDataToNextPowerOfTwo(datum1D, digitalFilterApplied);
  }

  Object.assign(datum1D.data, reimFFT(datum1D.data, { applyZeroShift: true }));

  if (digitalFilterApplied) {
    let { digitalFilter = 0 } = datum1D.info;
    let ph1 = (digitalFilter - Math.floor(digitalFilter)) * Math.PI * 2;
    Object.assign(datum1D.data, reimPhaseCorrection(datum1D.data, 0, ph1));
  }

  datum1D.data.x = generateXAxis(datum1D);
  datum1D.info = { ...datum1D.info, isFid: false, isFt: true };
}

export function isApplicable(datum1D: Datum1D) {
  if (datum1D.info.isComplex && datum1D.info.isFid) return true;
  return false;
}

export function reduce() {
  return {
    once: true,
    reduce: undefined,
  };
}

function generateXAxis(datum1D) {
  const info = datum1D.info;
  const baseFrequency = parseFloat(info.baseFrequency);
  const frequencyOffset = parseFloat(info.frequencyOffset);
  const spectralWidth = parseFloat(info.spectralWidth);
  const offset = frequencyOffset / baseFrequency;
  let spectralHalfWidth = 0.5 * spectralWidth;
  let nbPoints = datum1D.data.x.length;
  let firstPoint = offset - spectralHalfWidth;
  let dx = spectralWidth / (nbPoints - 1);
  const xAxis = new Float64Array(nbPoints);
  for (let i = 0; i < nbPoints; i++) {
    xAxis[i] = firstPoint;
    firstPoint += dx;
  }
  return xAxis;
}

function isPowerOfTwo(n) {
  return n !== 0 && (n & (n - 1)) === 0;
}

function hasSameLength(data: Data1D) {
  const xLength = data.x.length;
  for (const key of ['re', 'im'] as const) {
    if (xLength !== data[key].length) return false;
  }
  return true;
}
