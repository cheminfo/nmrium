import { reimFFT, reimPhaseCorrection, xMean } from 'ml-spectra-processing';
import { Data1D } from 'nmr-load-save/lib/types/Data1D';

import { FilterDomainUpdateRules } from '../../FiltersManager';
import { Datum1D } from '../../types/data1d/Datum1D';

import { padDataToNextPowerOfTwo } from './utils/padDataToNextPowerOfTwo';

export const id = 'fft';
export const name = 'FFT';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: true,
};

/**
 *
 * @param {Datum1d} datum1d
 */

export function apply(datum1D: Datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('fft not applicable on this data');
  }

  checkSameLength(datum1D);

  let digitalFilterApplied = datum1D.filters.some(
    (e) => e.name === 'digitalFilter' && e.flag,
  );

  const {
    meta: { AQ_mod: aqMod },
  } = datum1D;

  if (aqMod === 1) {
    removeDCOffset(datum1D, digitalFilterApplied);
  }

  if (!isPowerOfTwo(datum1D.data.x.length)) {
    padDataToNextPowerOfTwo(datum1D, digitalFilterApplied);
  }

  const { data, info } = datum1D;
  Object.assign(data, reimFFT(data, { applyZeroShift: true }));

  if (digitalFilterApplied) {
    let { digitalFilter = 0 } = info;
    let ph1 = (digitalFilter - Math.floor(digitalFilter)) * Math.PI * 2;
    Object.assign(data, reimPhaseCorrection(data, 0, ph1));
  }

  data.x = generateXAxis(datum1D);
  if (info?.reverse?.[0]) {
    data.re.reverse();
    data.im.reverse();
  }

  // Object.assign(datum1D.data, data);
  datum1D.info = { ...info, isFid: false, isFt: true };
}

export function isApplicable(
  datum1D: Datum1D,
): datum1D is Datum1D & { data: Required<Data1D> } {
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

function removeDCOffset(datum1D, digitalFilterApplied) {
  let { digitalFilter = 0 } = digitalFilterApplied ? datum1D.info : {};
  const data = datum1D.data;
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

  Object.assign(datum1D.data, { re: newRe, im: newIm });
  return datum1D;
}

function checkSameLength(datum1D: Datum1D) {
  const { data } = datum1D;
  if (data.x.length !== data.re.length || data.x.length !== data.im?.length) {
    throw new Error('The length of data should be equal');
  }
}
