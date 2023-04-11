import { FilterDomainUpdateRules } from '../../FiltersManager';
import { Data1D } from '../../types/data1d/Data1D';
import { Datum1D } from '../../types/data1d/Datum1D';

export const id = 'zeroFilling';
export const name = 'Zero Filling';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: false,
};

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [nbPoints]
 */
export interface ZeroFillingOptions {
  nbPoints?: number;
  factor?: number;
}

export function apply(datum1D: Datum1D, options: ZeroFillingOptions) {
  if (!isApplicable(datum1D)) {
    throw new Error('zeroFilling not applicable on this data');
  }

  let { nbPoints, factor = 2 } = options;

  if (!nbPoints) {
    nbPoints = 2 ** Math.round(Math.log2(datum1D.data.x.length * factor));
    const filter = datum1D.filters.find((filter) => filter.name === id);
    if (filter) {
      filter.value = { nbPoints };
    }
  }

  let digitalFilterApplied = datum1D.filters.some(
    (e) => e.name === 'digitalFilter' && e.flag,
  );

  let grpdly = datum1D.info?.digitalFilter || 0;
  let pointsToShift;
  if (grpdly > 0 && digitalFilterApplied) {
    pointsToShift = Math.floor(grpdly);
  } else {
    pointsToShift = 0;
  }

  const { re, im, x } = datum1D.data;

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

  datum1D.data = { ...datum1D.data, re: newRE, im: newIM, x: newX };
}

export function isApplicable(
  datum1D: Datum1D,
): datum1D is Datum1D & { data: Required<Data1D> } {
  if (datum1D.info.isComplex && datum1D.info.isFid) {
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
