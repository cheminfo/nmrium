import { Data1D } from '../../types/data1d';

function convert(value: Float64Array | number[] = []): Float64Array {
  return !ArrayBuffer.isView(value) && value ? Float64Array.from(value) : value;
}

export function convertDataToFloat64Array(data: Data1D): Data1D {
  return {
    x: convert(data.x),
    re: convert(data.re),
    im: convert(data?.im),
  };
}
