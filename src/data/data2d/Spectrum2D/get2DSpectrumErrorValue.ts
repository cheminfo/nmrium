import { Datum2D } from '../../types/data2d';
import { Data2DFid, Data2DFt } from '../../types/data2d/Data2D';

export interface Zone2DError {
  x: number;
  y: number;
}

export function get2DSpectrumErrorValue(datum: Datum2D): Zone2DError {
  const { data, info } = datum;
  const { minX, maxX, minY, maxY } = info.isFid
    ? (data as Data2DFid).re
    : (data as Data2DFt).rr;
  const x = Math.abs(maxX - minX) / 10000;
  const y = Math.abs(maxY - minY) / 10000;
  return { x, y };
}
