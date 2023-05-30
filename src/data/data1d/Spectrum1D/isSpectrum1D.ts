import { Spectrum, Spectrum1D } from 'nmr-processing';

export function isSpectrum1D(spectrum: Spectrum): spectrum is Spectrum1D {
  return spectrum.info.dimension === 1;
}
