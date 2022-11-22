import { Datum2D } from '../../types/data2d';

export interface Zone2DError {
  x: number;
  y: number;
}

export function get2DSpectrumErrorValue(datum: Datum2D): Zone2DError {
  const { minX, maxX, minY, maxY } = datum.data.rr;
  const x = Math.abs(maxX - minX) / 10000;
  const y = Math.abs(maxY - minY) / 10000;
  return { x, y };
}
