import { xNoiseSanPlot } from 'ml-spectra-processing';

import { Data1D } from '../../../../../data/types/data1d';
import { Data2D } from '../../../../../data/types/data2d';

export function processSnapPlot<T extends '1D' | '2D'>(
  dimension: T,
  data: T extends '1D' ? Data1D : Data2D,
  yLogBase: number,
) {
  const input =
    dimension === '1D'
      ? prepare1DData(data as Data1D)
      : prepare2DData(data as Data2D);

  const sanResult = xNoiseSanPlot(input);
  const sanPlot: any = {};
  const lines: any = {};
  for (let plotKey in sanResult.sanplot) {
    const { x, y } = sanResult.sanplot[plotKey];
    let result = new Array(x.length);
    for (let i = 0; i < x.length; i++) {
      result[i] = { x: x[i], y: y[i] };
    }
    sanPlot[plotKey] = result;
    lines[plotKey] = getLine(sanResult[plotKey], result, { yLogBase });
  }
  return { sanPlot, lines };
}

function prepare1DData(data: Data1D) {
  const length = data.re.length;
  const jump = Math.floor(length / 307200) || 1;
  const array = new Float64Array((length / jump) >> 0);
  let index = 0;
  for (let i = 0; i < array.length; i += jump) {
    array[index++] = data.re[i];
  }
  return array;
}

function prepare2DData(data: Data2D) {
  let cols = data.z[0].length;
  let rows = data.z.length;
  let jump = Math.floor((cols * rows) / 204800) || 1;
  const array = new Float64Array(((cols * rows) / jump) >> 0);
  let index = 0;
  for (let i = 0; i < array.length; i += jump) {
    array[index++] = data.z[(i / rows) >> 0][i % rows];
  }
  return array;
}

function getLine(value, data, options) {
  const { log10, abs } = Math;
  const { yLogBase } = options;
  const first = data.length > 0 ? data[0].x : 0;
  const last = data.length > 0 ? data[data.length - 1].x : 0;
  const inLogScale = log10(abs(value)) / log10(yLogBase);
  return [
    { x: first, y: inLogScale },
    { x: last, y: inLogScale },
  ];
}
