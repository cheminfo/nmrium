import type { DataXY } from 'cheminfo-types';
import mean from 'ml-array-mean';
import { gsd } from 'ml-gsd';
import { xFindClosestIndex } from 'ml-spectra-processing';

import { getRange } from '../../constants/References';

/**
 *
 * @param {*} datum1D
 * @param {object} [options={}]
 * @param {number} [options.from]
 * @param {number} [options.to] Define the from zone where the reference is expected to be found
 * @param {number} [options.from]
 * @param {number} [options.nbPeaks]
 * @param {number} [options.targetX]
 * @param {string} [options.reference]
 */
export function getReferenceShift(datum1D, options) {
  let { from, to, nbPeaks, targetX, reference } = options;
  if (reference) {
    let data = getRange({ reference, nucleus: datum1D.nucleus });
    from = data.from;
    to = data.to;
    nbPeaks = data.nbPeaks;
    targetX = data.delta;
  }

  const { re, x } = datum1D.data;
  return xyCalibrate({ x, y: re }, { from, to }, { nbPeaks, targetX });
}

// This is a copy of the function defined in https://github.com/cheminfo/spectra-processor/blob/b87f6f6c4d45a64dc16f3f9692d5f5dc7e398e5e/src/spectrum/xyCalibrate.js
function xyCalibrate(
  data: DataXY,
  range: { to?: number; from?: number } = {},
  options: {
    targetX?: number;
    nbPeaks?: number;
    gsd?: {
      minMaxRatio: number;
      realTopDetection: boolean;
      smoothY: boolean;
      sgOptions: {
        windowSize: number;
        polynomial: number;
      };
    };
  } = {},
): number {
  const {
    targetX = 0,
    nbPeaks = 1,
    gsd: gsdOptions = {
      minMaxRatio: 0.1,
      realTopDetection: true,
      smoothY: true,
      sgOptions: {
        windowSize: 7,
        polynomial: 3,
      },
    },
  } = options;
  let { from, to } = range;
  if (from === undefined || to === undefined) return 0;

  const fromIndex = xFindClosestIndex(data.x, from);
  const toIndex = xFindClosestIndex(data.x, to);
  const sliceddata = {
    x: data.x.slice(fromIndex, toIndex) as number[],
    y: data.y.slice(fromIndex, toIndex) as number[],
  };

  let peaks = gsd(sliceddata, gsdOptions)
    .sort((a, b) => b.y - a.y)
    .slice(0, nbPeaks);

  if (peaks.length === 0) return 0;

  const middle = mean(peaks.map((peak) => peak.x));

  return targetX - middle;
}
