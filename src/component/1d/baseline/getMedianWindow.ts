import type { Spectrum1D } from '@zakodium/nmrium-core';

export function getMedianWindow(spectrum: Spectrum1D) {
  const { data } = spectrum;
  return data.x.length / 100;
}
