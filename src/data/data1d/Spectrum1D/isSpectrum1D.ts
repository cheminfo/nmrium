import { Spectrum, Spectrum1D } from 'nmr-load-save';

export function isSpectrum1D(spectrum: Spectrum): spectrum is Spectrum1D {
  return spectrum.info.dimension === 1;
}
