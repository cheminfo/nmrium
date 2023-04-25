import {
  DataReIm,
  reimFFT,
  reimPhaseCorrection,
  xMean,
} from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { Data1D } from 'nmr-load-save/lib/types/Data1D';

import { FilterDomainUpdateRules } from '../../FiltersManager';

import { padDataToNextPowerOfTwo } from './utils/padDataToNextPowerOfTwo';

export const id = 'fft';
export const name = 'FFT';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: true,
};

/**
 *
 * @param {Spectrum1D} spectrum
 */

export function apply(spectrum: Spectrum1D) {
  if (!isApplicable(spectrum)) {
    throw new Error('fft not applicable on this data');
  }

  checkSameLength(spectrum);

  let digitalFilterApplied = spectrum.filters.some(
    (e) => e.name === 'digitalFilter' && e.flag,
  );

  const {
    meta: { AQ_mod: aqMod },
  } = spectrum;

  if (aqMod === 1) {
    removeDCOffset(spectrum, digitalFilterApplied);
  }

  if (!isPowerOfTwo(spectrum.data.x.length)) {
    padDataToNextPowerOfTwo(spectrum, digitalFilterApplied);
  }

  const { data, info } = spectrum;
  Object.assign(data, reimFFT(data as DataReIm, { applyZeroShift: true }));

  if (digitalFilterApplied) {
    let { digitalFilter = 0 } = info;
    let ph1 = (digitalFilter - Math.floor(digitalFilter)) * Math.PI * 2;
    Object.assign(data, reimPhaseCorrection(data as DataReIm, 0, -ph1, { reverse: true }));
  }

  data.x = generateXAxis(spectrum);
  if (info?.reverse?.[0]) {
    data.re.reverse();
    data.im.reverse();
  }

  // Object.assign(datum1D.data, data);
  spectrum.info = { ...info, isFid: false, isFt: true };
}

export function isApplicable(
  spectrum: Spectrum1D,
): spectrum is Spectrum1D & { data: Required<Data1D> } {
  if (spectrum.info.isComplex && spectrum.info.isFid) return true;
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
  const baseFrequency = Number.parseFloat(info.baseFrequency);
  const frequencyOffset = Number.parseFloat(info.frequencyOffset);
  const spectralWidth = Number.parseFloat(info.spectralWidth);
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

function removeDCOffset(spectrum, digitalFilterApplied) {
  let { digitalFilter = 0 } = digitalFilterApplied ? spectrum.info : {};
  const data = spectrum.data;
  const nbPoints = data.re.length;
  const newRe = new Float64Array(data.re);
  const newIm = new Float64Array(data.im);
  const averageRe = xMean(
    data.re.slice((nbPoints * 0.75) >> 0, nbPoints - digitalFilter),
  );
  const averageIm = xMean(
    data.im.slice((nbPoints * 0.75) >> 0, nbPoints - digitalFilter),
  );
  for (
    let i = digitalFilterApplied ? 0 : digitalFilter;
    i < nbPoints - digitalFilter;
    i++
  ) {
    newRe[i] -= averageRe;
    newIm[i] -= averageIm;
  }

  Object.assign(spectrum.data, { re: newRe, im: newIm });
  return spectrum;
}

function checkSameLength(spectrum: Spectrum1D) {
  const { data } = spectrum;
  if (data.x.length !== data.re.length || data.x.length !== data.im?.length) {
    throw new Error('The length of data should be equal');
  }
}
