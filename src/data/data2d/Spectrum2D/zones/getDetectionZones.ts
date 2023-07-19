import { Spectrum2D } from 'nmr-load-save';
import { xyzAutoZonesPicking } from 'nmr-processing';

export interface DetectionZonesOptions {
  selectedZone: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  };
  thresholdFactor: number;
  tolerances?: number[];
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
  spectrum: Spectrum2D,
  options: DetectionZonesOptions,
) {
  let dataMatrix = {};
  const { selectedZone } = options;
  if (selectedZone) {
    options.enhanceSymmetry = false;
    dataMatrix = getSubMatrix(spectrum, selectedZone);
  } else {
    dataMatrix = spectrum.data;
  }

  return autoZonesDetection(dataMatrix, {
    ...options,
    info: spectrum.info,
  });
}

function autoZonesDetection(data, options) {
  const {
    clean,
    tolerances,
    thresholdFactor,
    maxPercentCutOff,
    convolutionByFFT,
    info: { nucleus: nuclei, originFrequency },
  } = options;

  const { enhanceSymmetry = nuclei[0] === nuclei[1] } = options;

  const zones = xyzAutoZonesPicking(data, {
    nuclei,
    tolerances,
    observedFrequencies: originFrequency,
    thresholdFactor,
    realTopDetection: true,
    clean,
    maxPercentCutOff,
    enhanceSymmetry,
    convolutionByFFT,
  });

  return zones;
}

function getSubMatrix(datum, selectedZone) {
  const { fromX, toX, fromY, toY } = selectedZone;
  const data = datum.data.rr;
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

  const dataMatrix: any = {
    z: [],
    maxX: data.minX + xIndexTo * xStep,
    minX: data.minX + xIndexFrom * xStep,
    maxY: data.minY + yIndexTo * yStep,
    minY: data.minY + yIndexFrom * yStep,
  };
  let maxZ = Number.MIN_SAFE_INTEGER;
  let minZ = Number.MAX_SAFE_INTEGER;

  const nbXPoints = xIndexTo - xIndexFrom + 1;

  for (let j = yIndexFrom; j < yIndexTo; j++) {
    const row = new Float32Array(nbXPoints);
    let xIndex = xIndexFrom;
    for (let i = 0; i < nbXPoints; i++) {
      row[i] = data.z[j][xIndex++];
    }
    for (const rowValue of row) {
      if (maxZ < rowValue) maxZ = rowValue;
      if (minZ > rowValue) minZ = rowValue;
    }
    dataMatrix.z.push(Array.from(row));
  }
  dataMatrix.minZ = minZ;
  dataMatrix.maxZ = maxZ;
  return dataMatrix;
}
