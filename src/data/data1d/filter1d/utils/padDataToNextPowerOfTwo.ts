import { xSequentialFill } from 'ml-spectra-processing';
import { Data1D, Spectrum1D } from 'nmr-load-save';

export function padDataToNextPowerOfTwo(
  spectrum: Spectrum1D,
  digitalFilterApplied: boolean,
) {
  const { x, re, im } = spectrum.data as Required<Data1D>;
  const size = nextPowerOfTwo(x.length);

  let newRE = new Float64Array(size);
  let newIM = new Float64Array(size);

  const pointsToShift = getPointsToShift(spectrum);

  newRE.set(re.slice(0, size - pointsToShift));
  newIM.set(im.slice(0, size - pointsToShift));

  if (pointsToShift > 0 && digitalFilterApplied) {
    newRE.set(re.slice(re.length - pointsToShift), size - pointsToShift);
    newIM.set(im.slice(re.length - pointsToShift), size - pointsToShift);
  }

  const newX = xSequentialFill({
    from: x[0],
    size,
    step: x[1] - x[0],
  }) as Float64Array;

  spectrum.data = { ...spectrum.data, re: newRE, im: newIM, x: newX };
}

function getPointsToShift(spectrum: Spectrum1D) {
  let grpdly = spectrum.info?.digitalFilter || 0;
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
