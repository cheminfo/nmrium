import type { Spectrum1D, Spectrum } from '@zakodium/nmrium-core';

export function isSpectrum1D(
  spectrum: Spectrum | undefined,
): spectrum is Spectrum1D {
  return spectrum?.info.dimension === 1;
}

export function isFid1DSpectrum(
  spectrum: Spectrum | undefined,
): spectrum is Spectrum1D {
  return isSpectrum1D(spectrum) && spectrum.info.isFid;
}

export function isFt1DSpectrum(
  spectrum: Spectrum | undefined,
): spectrum is Spectrum1D {
  return isSpectrum1D(spectrum) && spectrum.info.isFt;
}
