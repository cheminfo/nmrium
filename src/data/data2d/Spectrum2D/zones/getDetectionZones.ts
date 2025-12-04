import type { Info2D } from '@zakodium/nmr-types';
import type { Spectrum2D } from '@zakodium/nmrium-core';
import type { NmrData2DContent, NmrData2DFt } from 'cheminfo-types';
import { xyzAutoZonesPicking } from 'nmr-processing';

export interface DetectionZonesOptions {
  selectedZone: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  };
  thresholdFactor: number;
  maxPercentCutOff: number;
  tolerances?: number[];
}

/**
 *
 * @param spectrum
 * @param options
 */
export function getDetectionZones(
  spectrum: Spectrum2D,
  options: DetectionZonesOptions,
) {
  const dataMatrix = getSubMatrix(spectrum, options.selectedZone);
  return autoZonesDetection(dataMatrix, spectrum.info, options);
}

function autoZonesDetection(
  data: NmrData2DContent,
  info: Info2D,
  options: DetectionZonesOptions,
) {
  const { tolerances, thresholdFactor, maxPercentCutOff } = options;
  const { nucleus: nuclei, originFrequency } = info;

  return xyzAutoZonesPicking(data, {
    nuclei,
    tolerances,
    observedFrequencies: originFrequency,
    thresholdFactor,
    realTopDetection: true,
    maxPercentCutOff,
    enhanceSymmetry: false,
  });
}

function getSubMatrix(
  datum: Spectrum2D,
  selectedZone: DetectionZonesOptions['selectedZone'],
): NmrData2DContent {
  const { fromX, toX, fromY, toY } = selectedZone;
  const data = (datum.data as NmrData2DFt).rr;
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

  const z: NmrData2DContent['z'] = [];
  let maxZ = Number.MAX_SAFE_INTEGER;
  let minZ = Number.MIN_SAFE_INTEGER;

  const nbXPoints = xIndexTo - xIndexFrom + 1;

  for (let j = yIndexFrom; j < yIndexTo; j++) {
    const row = new Float64Array(nbXPoints);
    let xIndex = xIndexFrom;
    for (let i = 0; i < nbXPoints; i++) {
      row[i] = data.z[j][xIndex++];
    }
    for (const rowValue of row) {
      if (maxZ < rowValue) maxZ = rowValue;
      if (minZ > rowValue) minZ = rowValue;
    }
    z.push(row);
  }

  return {
    z,
    maxX: data.minX + xIndexTo * xStep,
    minX: data.minX + xIndexFrom * xStep,
    maxY: data.minY + yIndexTo * yStep,
    minY: data.minY + yIndexFrom * yStep,
    maxZ,
    minZ,
  };
}
