import type { NmrData1D } from 'cheminfo-types';

function convert(value: Float64Array | number[]): Float64Array {
  return ArrayBuffer.isView(value) ? value : Float64Array.from(value)
}

export function convertDataToFloat64Array(data: NmrData1D): NmrData1D {
  const result = {
    x: convert(data.x),
    re: convert(data.re)
  }
  return data.im ? { im: convert(data.im), ...result } : result;
}
