import {
  reimFFT,
  reimFFTShift,
  reimPhaseCorrection,
} from 'ml-spectra-processing';

export const id = 'fft';
export const name = 'FFT';

/**
 *
 * @param {Datum1d} datum1d
 */

export function apply(datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('fft not applicable on this data');
  }

  let digitalFilterApplied = datum1D.filters.some(
    (e) => e.name === 'digitalFilter' && e.flag,
  );

  Object.assign(datum1D.data, reimFFTShift(reimFFT(datum1D.data)));

  if (digitalFilterApplied) {
    let { digitalFilter } = datum1D.info;
    let ph1 = (digitalFilter - Math.floor(digitalFilter)) * Math.PI * 2;
    Object.assign(datum1D.data, reimPhaseCorrection(datum1D.data, 0, ph1));
  }

  datum1D.data.x = generateXAxis(datum1D);
  datum1D.info = { ...datum1D.info, isFid: false };
}

export function isApplicable(datum1D) {
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
  const baseFrequency = parseFloat(info.bf1);
  const spectralFrequency = parseFloat(info.sfo1);
  const spectralWidth = parseFloat(info.spectralWidth);
  const offset = ((spectralFrequency - baseFrequency) / baseFrequency) * 1e6;
  let spectralHalfWidth = 0.5 * spectralWidth;

  let nbPoints = datum1D.data.x.length;
  let firstPoint = offset - spectralHalfWidth;
  let dx = spectralWidth / (nbPoints - 1);
  const xAxis = new Array(nbPoints);
  for (let i = 0; i < nbPoints; i++) {
    xAxis[i] = firstPoint;
    firstPoint += dx;
  }
  return xAxis;
}
