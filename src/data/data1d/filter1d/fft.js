import { FFT } from 'ml-fft';

/**
 *
 * @param {Datum1d} datum1d
 */

export default function fft(datum1D) {
  if (!isApplicable(datum1D)) {
    throw new Error('fft not isApplicable on this data');
  }

  let re = new Float64Array(datum1D.data.re);
  let im = new Float64Array(datum1D.data.im);

  const nbPoints = re.length;
  FFT.init(nbPoints);

  FFT.fft(re, im);

  let newRe = new Float64Array(re);
  let newIm = new Float64Array(im);
  newRe.set(re.slice(0, (nbPoints + 1) / 2), (nbPoints + 1) / 2);
  newRe.set(re.slice((nbPoints + 1) / 2));
  newIm.set(im.slice(0, (nbPoints + 1) / 2), (nbPoints + 1) / 2);
  newIm.set(im.slice((nbPoints + 1) / 2));

  datum1D.data.re = newRe;
  datum1D.data.im = newIm;
  // datum1D.data.x = generateXAxis(datum1D);
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
  const spectralWidth = parseFloat(info.sw);
  const xMiddle = ((spectralFrequency - baseFrequency) / baseFrequency) * 1e6;
  let dx = (0.5 * spectralWidth * spectralFrequency) / baseFrequency;

  let nbPoints = datum1D.data.x.length;
  let tmp = xMiddle + dx;
  dx = (-2 * dx) / (nbPoints - 1);
  const xAxis = new Array(nbPoints);
  for (let i = 0; i < nbPoints; i++) {
    xAxis[i] = tmp;
    tmp += dx;
  }
  return xAxis;
}
