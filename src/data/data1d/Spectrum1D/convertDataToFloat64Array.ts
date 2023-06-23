import { NmrData1D } from 'cheminfo-types';

function convert(value: Float64Array | number[] = []): Float64Array {
  return !ArrayBuffer.isView(value) && value ? Float64Array.from(value) : value;
}

export function convertDataToFloat64Array(data: NmrData1D): NmrData1D {
  return {
    x: convert(data.x),
    re: convert(data.re),
    im: convert(data?.im),
  };
}
