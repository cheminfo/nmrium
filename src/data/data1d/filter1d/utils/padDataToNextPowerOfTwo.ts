import { xSequentialFill } from 'ml-spectra-processing';

import { Datum1D } from '../../../types/data1d';

export function padDataToNextPowerOfTwo(
  datum1D: Datum1D,
  digitalFilterApplied: boolean,
) {
  const { x, re, im } = datum1D.data;
  const size = nextPowerOfTwo(x.length);

  let newRE = new Float64Array(size);
  let newIM = new Float64Array(size);

  const pointsToShift = getPointsToShift(datum1D);

  newRE.set(re.slice(0, length - pointsToShift));
  newIM.set(im.slice(0, length - pointsToShift));

  if (pointsToShift > 0 && digitalFilterApplied) {
    newRE.set(re.slice(re.length - pointsToShift), size - pointsToShift);
    newIM.set(im.slice(re.length - pointsToShift), size - pointsToShift);
  }

  const newX = xSequentialFill({
    from: x[0],
    size,
    step: x[1] - x[0],
  }) as Float64Array;

  datum1D.data = { ...datum1D.data, re: newRE, im: newIM, x: newX };
}

function getPointsToShift(datum1D: Datum1D) {
  let grpdly = datum1D.info?.digitalFilter || 0;
  return grpdly > 0 ? Math.floor(grpdly) : 0;
}

function nextPowerOfTwo(n: number) {
  if (n === 0) return 1;
  n--;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  return n + 1;
}
