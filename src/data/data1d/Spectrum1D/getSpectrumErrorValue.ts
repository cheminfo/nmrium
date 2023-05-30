import { Spectrum1D } from 'nmr-processing';

export function getSpectrumErrorValue(spectrum: Spectrum1D) {
  const { x } = spectrum.data;
  return ((x.at(-1) as number) - x[0]) / 10000;
}
