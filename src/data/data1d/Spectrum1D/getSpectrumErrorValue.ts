import { Spectrum1D } from 'nmr-load-save';

export function getSpectrumErrorValue(spectrum: Spectrum1D) {
  const { x } = spectrum.data;
  return (x[x.length - 1] - x[0]) / 10000;
}
