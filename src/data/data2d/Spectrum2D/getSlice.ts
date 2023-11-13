import type {
  NmrData1D,
  NmrData2D,
  NmrData2DFid,
  NmrData2DFt,
} from 'cheminfo-types';
import { zoneToX } from 'ml-spectra-processing';
import type { Spectrum1D, Spectrum2D } from 'nmr-load-save';
import { Info2D } from 'nmr-processing';

import { TraceDirection } from '../../../component/reducer/Reducer';
import { initiateDatum1D } from '../../data1d/Spectrum1D';

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

  const real = getRealData(spectraData, info);
  const imaginary = getImaginaryData(spectraData, info);

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
    const imaginaryVerticalData = getImaginaryData(spectraData, info, {
      ftObjectKey: 'ri',
    });

    if (imaginaryVerticalData) {
      infoY.isComplex = true;
      for (let i = 0; i < yLength; i++) {
        dataY.im = new Float64Array(yLength);
        dataY.im[i] += imaginaryVerticalData.z[i][xIndex];
      }
    }
  }

  const horizontal = initiateDatum1D({ info: infoX, data: dataX });
  const vertical = initiateDatum1D({ info: infoY, data: dataY });
  return { horizontal, vertical };
}

function initiateData(from: number, to: number, length: number): NmrData1D {
  return {
    x: zoneToX({ from, to }, length),
    re: new Float64Array(length),
  };
}

function getRealData(data: NmrData2D, info: Info2D) {
  if (info.isFid) {
    return (data as NmrData2DFid).re;
  }
  return (data as NmrData2DFt).rr;
}
function getImaginaryData(
  data: NmrData2D,
  info: Info2D,
  options: { ftObjectKey?: 'ir' | 'ri' } = {},
) {
  if (info.isFid) {
    return (data as NmrData2DFid).im;
  }
  const { ftObjectKey = 'ir' } = options;

  return (data as NmrData2DFt)?.[ftObjectKey];
}
