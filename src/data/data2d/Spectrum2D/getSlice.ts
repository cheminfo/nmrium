import type { Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';
import type { NmrData1D, NmrData2D } from 'cheminfo-types';
import { xSequentialFillFromTo } from 'ml-spectra-processing';

import type { TraceDirection } from '../../../component/reducer/Reducer.js';
import { initiateDatum1D } from '../../data1d/Spectrum1D/index.js';

import { isFid2DData } from './isSpectrum2D.js';

/** get 2d projection
 * @param {number} x in ppm
 * @param {number} y in ppm
 */

interface SlicePosition {
  x: number;
  y: number;
}

const BASE_INFO = {
  isFid: false,
  isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
  dimension: 1,
};

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

  const real = getRealData(spectraData);
  const imaginary = getImaginaryData(spectraData);

  const xLength = real.z[0].length;
  const yLength = real.z.length;

  const xStep = (real.maxX - real.minX) / (xLength - 1);
  const yStep = (real.maxY - real.minY) / (yLength - 1);
  const xIndex = Math.floor((position.x - real.minX) / xStep);
  const yIndex = Math.floor((position.y - real.minY) / yStep);

  if (xIndex < 0 || xIndex >= real.z[0].length) return;
  if (yIndex < 0 || yIndex >= real.z.length) return;

  const infoX = {
    nucleus: info.nucleus[0], // 1H, 13C, 19F, ...
    ...BASE_INFO,
  };

  const infoY = {
    nucleus: info.nucleus[1], // 1H, 13C, 19F, ...
    ...BASE_INFO,
  };

  const dataX = initiateData(real.minX, real.maxX, xLength);
  const dataY = initiateData(real.minY, real.maxY, yLength);

  if (['real', 'both'].includes(sliceType)) {
    for (let i = 0; i < xLength; i++) {
      dataX.re[i] += real.z[yIndex][i];
    }
    for (let i = 0; i < yLength; i++) {
      dataY.re[i] += real.z[i][xIndex];
    }
  }

  if (imaginary && ['imaginary', 'both'].includes(sliceType)) {
    infoX.isComplex = true;
    dataX.im = new Float64Array(xLength);
    for (let i = 0; i < xLength; i++) {
      dataX.im[i] += imaginary.z[yIndex][i];
    }

    //FT spectra vertical slicing should use ri instead of ir
    const imaginaryVerticalData = getImaginaryData(spectraData, {
      ftObjectKey: 'ri',
    });

    if (imaginaryVerticalData) {
      infoY.isComplex = true;
      dataY.im = new Float64Array(yLength);
      for (let i = 0; i < yLength; i++) {
        dataY.im[i] += imaginaryVerticalData.z[i][xIndex];
      }
    }
  }

  const horizontal = initiateDatum1D({ info: infoX, data: dataX });
  const vertical = initiateDatum1D({ info: infoY, data: dataY });
  return { horizontal, vertical };
}

function initiateData(from: number, to: number, size: number): NmrData1D {
  return {
    x: xSequentialFillFromTo({ from, to, size }),
    re: new Float64Array(size),
  };
}

function getRealData(data: NmrData2D) {
  if (isFid2DData(data)) {
    return data.re;
  }
  return data.rr;
}
function getImaginaryData(
  data: NmrData2D,
  options: { ftObjectKey?: 'ir' | 'ri' } = {},
) {
  if (isFid2DData(data)) {
    return data.im;
  }
  const { ftObjectKey = 'ir' } = options;

  return data?.[ftObjectKey];
}
