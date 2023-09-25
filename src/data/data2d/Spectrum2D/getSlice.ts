import type { NmrData1D, NmrData2DFid, NmrData2DFt } from 'cheminfo-types';
import { zoneToX } from 'ml-spectra-processing';
import type { Spectrum1D, Spectrum2D } from 'nmr-load-save';

import { initiateDatum1D } from '../../data1d/Spectrum1D';
import { TraceDirection } from '../../../component/reducer/Reducer';

/** get 2d projection
 * @param {number} x in ppm
 * @param {number} y in ppm
 */

interface SlicePosition {
  x: number;
  y: number;
}

interface SliceOptions {
  sliceType?: 'real' | 'imaginary' | 'both';
}

export function getSlice(
  spectrum: Spectrum2D,
  position: SlicePosition,
  options: SliceOptions = {},
): Record<TraceDirection, Spectrum1D> | undefined {
  const { sliceType = 'real' } = options;
  const { data: spectraData, info } = spectrum;
  const realData = info.isFid
    ? (spectraData as NmrData2DFid).re
    : (spectraData as NmrData2DFt).rr;
  const imaginaryData = info.isFid
    ? (spectraData as NmrData2DFid).im
    : (spectraData as NmrData2DFt).ir;

  const xStep = (realData.maxX - realData.minX) / (realData.z[0].length - 1);
  const yStep = (realData.maxY - realData.minY) / (realData.z.length - 1);
  const xIndex = Math.floor((position.x - realData.minX) / xStep);
  const yIndex = Math.floor((position.y - realData.minY) / yStep);

  if (xIndex < 0 || xIndex >= realData.z[0].length) return;
  if (yIndex < 0 || yIndex >= realData.z.length) return;

  const infoX = {
    nucleus: info.nucleus[0], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  const infoY = {
    nucleus: info.nucleus[1], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  const dataX: NmrData1D = {
    x: zoneToX(
      { from: realData.minX, to: realData.maxX },
      realData.z[0].length,
    ),
    re: new Float64Array(realData.z[0].length),
  };

  const dataY: NmrData1D = {
    x: zoneToX({ from: realData.minY, to: realData.maxY }, realData.z.length),
    re: new Float64Array(realData.z.length),
  };

  if (['real', 'both'].includes(sliceType)) {
    for (let i = 0; i < realData.z[0].length; i++) {
      dataX.re[i] += realData.z[yIndex][i];
    }
    for (let i = 0; i < realData.z.length; i++) {
      dataY.re[i] += realData.z[i][xIndex];
    }
  }

  if (imaginaryData && ['imaginary', 'both'].includes(sliceType)) {
    infoX.isComplex = true;
    infoY.isComplex = true;
    dataX.im = new Float64Array(imaginaryData.z[0].length);
    dataY.im = new Float64Array(realData.z.length);

    for (let i = 0; i < imaginaryData.z[0].length; i++) {
      dataX.im[i] += imaginaryData.z[yIndex][i];
    }

    for (let i = 0; i < imaginaryData.z.length; i++) {
      dataY.im[i] += imaginaryData.z[i][xIndex];
    }
  }

  const horizontal = initiateDatum1D({ info: infoX, data: dataX });
  const vertical = initiateDatum1D({ info: infoY, data: dataY });
  return { horizontal, vertical };
}
