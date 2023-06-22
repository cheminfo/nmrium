import { NmrData2DFt, NmrData2DFid } from 'cheminfo-types';
import { Spectrum2D } from 'nmr-load-save';

export interface Zone2DError {
  x: number;
  y: number;
}

export function get2DSpectrumErrorValue(spectrum: Spectrum2D): Zone2DError {
  const { data, info } = spectrum;
  const { minX, maxX, minY, maxY } = info.isFid
    ? (data as NmrData2DFid).re
    : (data as NmrData2DFt).rr;
  const x = Math.abs(maxX - minX) / 10000;
  const y = Math.abs(maxY - minY) / 10000;
  return { x, y };
}
