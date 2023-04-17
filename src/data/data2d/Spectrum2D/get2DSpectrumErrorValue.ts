import { Spectrum2D, Data2DFid, Data2DFt } from 'nmr-load-save';

export interface Zone2DError {
  x: number;
  y: number;
}

export function get2DSpectrumErrorValue(spectrum: Spectrum2D): Zone2DError {
  const { data, info } = spectrum;
  const { minX, maxX, minY, maxY } = info.isFid
    ? (data as Data2DFid).re
    : (data as Data2DFt).rr;
  const x = Math.abs(maxX - minX) / 10000;
  const y = Math.abs(maxY - minY) / 10000;
  return { x, y };
}
