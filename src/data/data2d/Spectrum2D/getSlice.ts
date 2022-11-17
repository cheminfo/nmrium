import { zoneToX } from 'ml-spectra-processing';

import { initiateDatum1D } from '../../data1d/Spectrum1D';
import { Datum2D } from '../../types/data2d';

/** get 2d projection
 * @param {number} x in ppm
 * @param {number} y in ppm
 */

interface SlicePosition {
  x: number;
  y: number;
}

export function getSlice(spectrum: Datum2D, position: SlicePosition) {
  const data = spectrum.data;
  const xStep = (data.maxX - data.minX) / (data.z[0].length - 1);
  const yStep = (data.maxY - data.minY) / (data.z.length - 1);
  const xIndex = Math.floor((position.x - data.minX) / xStep);
  const yIndex = Math.floor((position.y - data.minY) / yStep);

  if (xIndex < 0 || xIndex >= data.z[0].length) return;
  if (yIndex < 0 || yIndex >= data.z.length) return;

  let infoX = {
    nucleus: spectrum.info.nucleus[0], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  let dataX = {
    x: zoneToX(
      { from: spectrum.data.minX, to: spectrum.data.maxX },
      spectrum.data.z[0].length,
    ),
    re: new Float64Array(spectrum.data.z[0].length),
  };

  for (let i = 0; i < spectrum.data.z[0].length; i++) {
    dataX.re[i] += spectrum.data.z[yIndex][i];
  }

  let infoY = {
    nucleus: spectrum.info.nucleus[1], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  let dataY = {
    x: zoneToX(
      { from: spectrum.data.minY, to: spectrum.data.maxY },
      spectrum.data.z.length,
    ),
    re: new Float64Array(spectrum.data.z.length),
  };

  let index = spectrum.data.z.length - 1;
  for (let i = 0; i < spectrum.data.z.length; i++) {
    dataY.re[i] += spectrum.data.z[index--][xIndex];
  }
  const horizontal = initiateDatum1D({ info: infoX, data: dataX }, {});
  const vertical = initiateDatum1D({ info: infoY, data: dataY }, {});
  return { horizontal, vertical };
}
