import { xyzAutoZonesPicking } from 'nmr-processing';

import { Datum2D } from '../../../types/data2d';

export interface DetectionZonesOptions {
  selectedZone: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  };
  thresholdFactor: number;
  convolutionByFFT?: boolean;
  enhanceSymmetry?: boolean;
}

/**
 *
 * @param {object} options
 * @param {object} options.selectedZone
 * @param {number} options.selectedZone.fromX
 * @param {number} options.selectedZone.fromY
 * @param {number} options.selectedZone.toX
 * @param {number} options.selectedZone.toY
 * @param {number} options.thresholdFactor
 * @param {boolean} options.convolutionByFFT
 */
export function getDetectionZones(
  datum: Datum2D,
  options: DetectionZonesOptions,
) {
  let dataMatrix = {};
  if (options.selectedZone) {
    options.enhanceSymmetry = false;
    dataMatrix = getSubMatrix(datum, options.selectedZone);
  } else {
    dataMatrix = datum.data;
  }
  return autoZonesDetection(dataMatrix, { ...options, info: datum.info });
}

function autoZonesDetection(data, options) {
  const { thresholdFactor, clean, maxPercentCutOff, convolutionByFFT } =
    options;

  const { nucleus: nuclei, originFrequency } = options.info;
  const { enhanceSymmetry = nuclei[0] === nuclei[1] } = options;

  let zones = xyzAutoZonesPicking(data, {
    nuclei,
    observedFrequencies: originFrequency,
    thresholdFactor,
    clean,
    maxPercentCutOff,
    enhanceSymmetry,
    convolutionByFFT,
  });

  return zones;
}

function getSubMatrix(datum, selectedZone) {
  const { fromX, toX, fromY, toY } = selectedZone;
  const data = datum.data;
  const xStep = (data.maxX - data.minX) / (data.z[0].length - 1);
  const yStep = (data.maxY - data.minY) / (data.z.length - 1);
  let xIndexFrom = Math.max(Math.floor((fromX - data.minX) / xStep), 0);
  let yIndexFrom = Math.max(Math.floor((fromY - data.minY) / yStep), 0);
  let xIndexTo = Math.min(
    Math.floor((toX - data.minX) / xStep),
    data.z[0].length - 1,
  );
  let yIndexTo = Math.min(
    Math.floor((toY - data.minY) / yStep),
    data.z.length - 1,
  );

  if (xIndexFrom > xIndexTo) [xIndexFrom, xIndexTo] = [xIndexTo, xIndexFrom];
  if (yIndexFrom > yIndexTo) [yIndexFrom, yIndexTo] = [yIndexTo, yIndexFrom];

  let dataMatrix: any = {
    z: [],
    maxX: data.minX + xIndexTo * xStep,
    minX: data.minX + xIndexFrom * xStep,
    maxY: data.minY + yIndexTo * yStep,
    minY: data.minY + yIndexFrom * yStep,
  };
  let maxZ = Number.MIN_SAFE_INTEGER;
  let minZ = Number.MAX_SAFE_INTEGER;

  let nbXPoints = xIndexTo - xIndexFrom + 1;

  for (let j = yIndexFrom; j < yIndexTo; j++) {
    let row = new Float32Array(nbXPoints);
    let xIndex = xIndexFrom;
    for (let i = 0; i < nbXPoints; i++) {
      row[i] = data.z[j][xIndex++];
    }
    for (let rowValue of row) {
      if (maxZ < rowValue) maxZ = rowValue;
      if (minZ > rowValue) minZ = rowValue;
    }
    dataMatrix.z.push(Array.from(row));
  }
  dataMatrix.minZ = minZ;
  dataMatrix.maxZ = maxZ;
  return dataMatrix;
}
