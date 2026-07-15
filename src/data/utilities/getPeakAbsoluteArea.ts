import type { Peak1D } from '@zakodium/nmr-types';
import { getShape1D } from 'ml-peak-shape-generator';

export function getPeakAbsoluteArea(peak: Peak1D) {
  const { shape, y } = peak;
  return shape ? getShape1D(shape).getArea(y) : 0;
}
