import { zoneToX } from 'ml-spectra-processing';

import { initiateDatum1D } from '../../data1d/Spectrum1D';
import { Datum2D } from '../../types/data2d';
import { Data2DFid, Data2DFt } from '../../types/data2d/Data2D';

/** get 2d projection
 * @param {number} x in ppm
 * @param {number} y in ppm
 */

interface SlicePosition {
  x: number;
  y: number;
}

export function getSlice(spectrum: Datum2D, position: SlicePosition) {
  const { data: spectraData, info } = spectrum;
  const data = info.isFid
    ? (spectraData as Data2DFid).re
    : (spectraData as Data2DFt).rr;
  const xStep = (data.maxX - data.minX) / (data.z[0].length - 1);
  const yStep = (data.maxY - data.minY) / (data.z.length - 1);
  const xIndex = Math.floor((position.x - data.minX) / xStep);
  const yIndex = Math.floor((position.y - data.minY) / yStep);

  if (xIndex < 0 || xIndex >= data.z[0].length) return;
  if (yIndex < 0 || yIndex >= data.z.length) return;

  let infoX = {
    nucleus: info.nucleus[0], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  let dataX = {
    x: zoneToX({ from: data.minX, to: data.maxX }, data.z[0].length),
    re: new Float64Array(data.z[0].length),
  };

  for (let i = 0; i < data.z[0].length; i++) {
    dataX.re[i] += data.z[yIndex][i];
  }

  let infoY = {
    nucleus: info.nucleus[1], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  let dataY = {
    x: zoneToX({ from: data.minY, to: data.maxY }, data.z.length),
    re: new Float64Array(data.z.length),
  };

  let index = data.z.length - 1;
  for (let i = 0; i < data.z.length; i++) {
    dataY.re[i] += data.z[index--][xIndex];
  }
  const horizontal = initiateDatum1D({ info: infoX, data: dataX }, {});
  const vertical = initiateDatum1D({ info: infoY, data: dataY }, {});
  return { horizontal, vertical };
}
