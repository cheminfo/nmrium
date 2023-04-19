import { Data1D, Spectrum1D } from 'nmr-load-save';
import { FilterDomainUpdateRules } from '../../FiltersManager';

export const id = 'zeroFilling';
export const name = 'Zero filling';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: false,
};

/**
 *
 * @param {Spectrum1D} spectrum
 * @param {Object} [nbPoints]
 */
export interface ZeroFillingOptions {
  nbPoints?: number;
  factor?: number;
}

export function apply(spectrum: Spectrum1D, options: ZeroFillingOptions) {
  if (!isApplicable(spectrum)) {
    throw new Error('zeroFilling not applicable on this data');
  }

  let { nbPoints, factor = 2 } = options;

  if (!nbPoints) {
    nbPoints = 2 ** Math.round(Math.log2(spectrum.data.x.length * factor));
    const filter = spectrum.filters.find((filter) => filter.name === id);
    if (filter) {
      filter.value = { nbPoints };
    }
  }

  let digitalFilterApplied = spectrum.filters.some(
    (e) => e.name === 'digitalFilter' && e.flag,
  );

  let grpdly = spectrum.info?.digitalFilter || 0;
  let pointsToShift;
  if (grpdly > 0 && digitalFilterApplied) {
    pointsToShift = Math.floor(grpdly);
  } else {
    pointsToShift = 0;
  }

  const { re, im = [], x } = spectrum.data;

  let newRE = new Float64Array(nbPoints);
  let newIM = new Float64Array(nbPoints);
  let newX = new Float64Array(nbPoints);

  const length = Math.min(nbPoints, re.length);

  newRE.set(re.slice(0, length - pointsToShift));
  newIM.set(im.slice(0, length - pointsToShift));
  newX.set(x.slice(0, length - pointsToShift));

  let diff = x[1] - x[0];
  let currentX = x[length - pointsToShift - 1];
  for (let i = length - pointsToShift; i < nbPoints; i++) {
    currentX += diff;
    newX[i] = currentX;
  }

  if (pointsToShift > 0 && pointsToShift < nbPoints) {
    newRE.set(re.slice(re.length - pointsToShift), nbPoints - pointsToShift);
    newIM.set(im.slice(re.length - pointsToShift), nbPoints - pointsToShift);
  }

  spectrum.data = { ...spectrum.data, re: newRE, im: newIM, x: newX };
}

export function isApplicable(
  spectrum: Spectrum1D,
): spectrum is Spectrum1D & { data: Required<Data1D> } {
  if (spectrum.info.isComplex && spectrum.info.isFid) {
    return true;
  }
  return false;
}

export function reduce(_previousValue, newValue) {
  delete newValue.factor;

  return {
    once: true,
    reduce: newValue,
  };
}
