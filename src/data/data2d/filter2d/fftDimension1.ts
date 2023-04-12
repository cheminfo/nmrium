import { FilterDomainUpdateRules } from '../../FiltersManager';
import { Data2D, Datum2D } from '../../types/data2d';

export const id = 'fftDimension1';
export const name = 'FFT Dimension 1';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: true,
  updateYDomain: true,
};

export function apply(datum2D: Datum2D) {
  if (!isApplicable(datum2D)) {
    throw new Error('fft dimension 1 not applicable on this data');
  }

  // eslint-disable-next-line no-console
  console.log('FFT Dimension 1 ');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, info } = datum2D;
}

export function isApplicable(
  datum2D: Datum2D,
): datum2D is Datum2D & { data: Required<Data2D> } {
  if (datum2D.info.isComplex && datum2D.info.isFid) return true;
  return false;
}

export function reduce() {
  return {
    once: true,
    reduce: undefined,
  };
}
