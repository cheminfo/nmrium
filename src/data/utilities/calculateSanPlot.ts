import { xNoiseSanPlot } from 'ml-spectra-processing';

import { Data1D } from '../types/data1d';
import { MinMaxContent } from '../types/data2d/Data2D';

export function calculateSanPlot<T extends '1D' | '2D'>(
  dimension: T,
  data: T extends '1D' ? Data1D : MinMaxContent,
) {
  const input =
    dimension === '1D'
      ? prepare1DData(data as Data1D)
      : prepare2DData(data as MinMaxContent);

  return xNoiseSanPlot(input);
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

function prepare2DData(data: MinMaxContent) {
  let cols = data.z[0].length;
  let rows = data.z.length;
  let jump = Math.floor((cols * rows) / 204800) || 1;
  const array = new Float64Array(((cols * rows) / jump) >> 0);
  let index = 0;
  // console.log('jump', jump, cols * rows);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += jump) {
      array[index++] = data.z[r][c];
    }
  }

  return array;
}
