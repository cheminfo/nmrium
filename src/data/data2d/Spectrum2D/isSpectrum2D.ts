import { Spectrum, Spectrum2D } from 'nmr-load-save';

export function isSpectrum2D(spectrum: Spectrum): spectrum is Spectrum2D {
  return spectrum.info.dimension === 2;
}
