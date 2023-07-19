import { NmrData2DFt, NmrData1D } from 'cheminfo-types';
import { xNoiseSanPlot } from 'ml-spectra-processing';

export function calculateSanPlot<T extends '1D' | '2D'>(
  dimension: T,
  data: T extends '1D' ? NmrData1D : NmrData2DFt['rr'],
) {
  const input =
    dimension === '1D'
      ? prepare1DData(data as NmrData1D)
      : prepare2DData(data as NmrData2DFt['rr']);

  return xNoiseSanPlot(input);
}

function prepare1DData(data: NmrData1D) {
  const length = data.re.length;
  const jump = Math.floor(length / 307200) || 1;
  const array = new Float64Array((length / jump) >> 0);
  let index = 0;
  for (let i = 0; i < array.length; i += jump) {
    array[index++] = data.re[i];
  }
  return array;
}

function prepare2DData(data: NmrData2DFt['rr']) {
  const cols = data.z[0].length;
  const rows = data.z.length;
  const jump = Math.floor((cols * rows) / 204800) || 1;
  const array = new Float64Array(((cols * rows) / jump) >> 0);
  let index = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += jump) {
      array[index++] = data.z[r][c];
    }
  }

  return array;
}
