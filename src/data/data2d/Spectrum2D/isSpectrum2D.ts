import type { Spectrum2D, Spectrum } from '@zakodium/nmrium-core';
import type { NmrData2D, NmrData2DFid, NmrData2DFt } from 'cheminfo-types';

export function isSpectrum2D(
  spectrum: Spectrum | undefined,
): spectrum is Spectrum2D {
  return spectrum?.info.dimension === 2;
}

function isQuadrantsData(data: NmrData2D): data is NmrData2DFt {
  return 'rr' in data && 'ri' in data && 'ir' in data && 'ii' in data;
}
function isFt2DData(data: NmrData2D): data is NmrData2DFt {
  return 'rr' in data;
}

export function isFid2DData(data: NmrData2D): data is NmrData2DFid {
  return 're' in data;
}

export function isFid2DSpectrum(
  spectrum: Spectrum,
): spectrum is Spectrum2D & { data: NmrData2DFid } {
  return isSpectrum2D(spectrum) && isFid2DData(spectrum.data);
}

export function isFt2DSpectrum(
  spectrum: Spectrum,
): spectrum is Spectrum2D & { data: NmrData2DFt } {
  return isSpectrum2D(spectrum) && isFt2DData(spectrum.data);
}
export function isQuadrants2DSpectrum(
  spectrum: Spectrum,
): spectrum is Spectrum2D & { data: NmrData2DFt } {
  return isSpectrum2D(spectrum) && isQuadrantsData(spectrum.data);
}
