import { zoneToX } from 'ml-spectra-processing';

import { DatumKind } from '../constants/SignalsKinds';
import { initiateDatum1D } from '../data1d/Datum1D';
import generateID from '../utilities/generateID';
import { get2DColor } from '../utilities/getColor';

import Processing2D, { defaultContourOpions } from './Processing2D';
import autoZonesDetection from './autoZonesDetection';

export const usedColors2D: Array<string> = [];

export interface Data2D {
  z: Array<Array<number>>;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ContourOptions {
  positive: {
    contourLevels: [number, number];
    numberOfLayers: number;
  };
  negative: {
    contourLevels: [number, number];
    numberOfLayers: number;
  };
}

export interface Display {
  name: string;
  positiveColor: string;
  negativeColor: string;
  isVisible: boolean;
  isPositiveVisible: boolean;
  isNegativeVisible: boolean;
  contourOptions: ContourOptions;
  isVisibleInDomain: boolean;
}

export interface Info {
  nucleus: Array<string>;
  isFid: boolean;
  isComplex: boolean;
  dimension: number;
  isFt: boolean;
}

export interface Signal {
  id: number;
  peak: any;
  x: Partial<{
    delta: number;
    diaID: any;
  }>;
  y: Partial<{
    delta: number;
    diaID: any;
  }>;
  kind: string;
}

export interface Zone {
  id: number;
  x: Partial<{ from: number; to: number }>;
  y: Partial<{ from: number; to: number }>;
  signal: Signal;
  kind: string;
}

export interface ZoneOption {
  sum: number;
}
export interface Zones {
  values: Array<Partial<Zone>>;
  options?: Partial<ZoneOption>;
}

export type Filters = Array<
  Partial<{ name: string; isDeleteAllow: boolean; options?: any }>
>;

export interface Datum2D {
  id: string;
  source: Partial<{ jcamp: string; jcampURL: string; original: Data2D }>;
  display: Display;
  info: Partial<Info>;
  originalInfo: Partial<Info>;
  meta: any;
  data: Data2D;
  zones: Zones;
  filters: Filters;
  processingController: Processing2D;
}

export function initiateDatum2D(options: any): Datum2D {
  const datum: any = {};

  datum.id = options.id || generateID();
  datum.source = Object.assign(
    {
      jcamp: null,
      jcampURL: null,
      original: [],
    },
    options.source,
  );
  datum.display = Object.assign(
    {
      name: options.display.name || generateID(),
      positiveColor: 'red',
      negativeColor: 'blue',
      ...getColor(options),
      isPositiveVisible: true,
      isNegativeVisible: true,
      contourOptions: defaultContourOpions,
    },
    options.display,
  );

  datum.info = Object.assign(
    {
      nucleus: ['1H', '1H'],
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    },
    options.info,
  );

  datum.originalInfo = Object.assign(
    {
      nucleus: ['1H', '1H'], // 1H, 13C, 19F, ...
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    },
    options.info,
  );
  datum.meta = Object.assign({}, options.meta);
  datum.data = Object.assign(
    {
      z: [],
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    },
    options.data,
  );
  datum.zones = Object.assign({ values: [], options: {} }, options.zones);

  datum.processingController = new Processing2D(
    datum.data,
    datum.display.contourOptions,
  );

  return datum;
}

function getColor(options) {
  if (
    options.display === undefined ||
    options.display.negativeColor === undefined ||
    options.display.positiveColor === undefined
  ) {
    const color = get2DColor(options.info.experiment, usedColors2D);
    usedColors2D.push(color.positiveColor);
    return color;
  }
  return {};
}

export function toJSON(datum: any) {
  return {
    data: datum.data,
    id: datum.id,
    source: {
      jcamp: datum.source.jcamp,
      jcampURL: datum.source.jcampURL,
      original: datum.source.jcampURL ? [] : datum.source.original,
    },
    zones: datum.zones,
    display: datum.display,
    info: datum.originalInfo,
    meta: datum.meta,
  };
}

/** get 2d projection
 * @param {number} x in ppm
 * @param {number} y in ppm
 */
export function getSlice(spectrum, position) {
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

  const horizontal = initiateDatum1D({ info: infoX, data: dataX });
  const vertical = initiateDatum1D({ info: infoY, data: dataY });
  return { horizontal, vertical };
}

/**
 *
 * @param {number} zoneID
 * @param {object} signal
 * @param {number} signal.x
 * @param {number} signal.y
 * @param {string} signal.id
 */
export function changeZoneSignal(datum, zoneID, newSignal) {
  const zoneIndex = datum.zones.values.findIndex((zone) => zone.id === zoneID);
  if (zoneIndex !== -1) {
    const signalIndex = datum.zones.values[zoneIndex].signal.findIndex(
      (s) => s.id === newSignal.id,
    );
    if (signalIndex !== -1) {
      const originalSignal = datum.zones.values[zoneIndex].signal[signalIndex];
      const shiftX = newSignal.x ? newSignal.x - originalSignal.x.delta : 0;
      const shiftY = newSignal.y ? newSignal.y - originalSignal.y.delta : 0;
      shiftXY(datum, { x: shiftX, y: shiftY });

      if (newSignal.x) {
        datum.zones.values[zoneIndex].signal[signalIndex].x.delta = newSignal.x;
      }
      if (newSignal.y) {
        datum.zones.values[zoneIndex].signal[signalIndex].y.delta = newSignal.y;
      }
    }
  }
}

function shiftXY(datum, { x, y }) {
  datum.data.minX += x;
  datum.data.maxX += x;
  datum.data.minY += y;
  datum.data.maxY += y;
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
export function detectZonesManual(datum, options) {
  const { fromX, toX, fromY, toY } = options.selectedZone;
  const zones = getDetectionZones(datum, options);
  const signals = zones.map((zone) => {
    return {
      id: generateID(),
      peak: zone.peaks,
      x: {
        delta: zone.shiftX,
        diaID: [],
      },
      y: {
        delta: zone.shiftY,
        diaID: [],
      },
      kind: 'signal',
    };
  });
  const zone = {
    id: generateID(),
    x: { from: fromX, to: toX },
    y: { from: fromY, to: toY },
    signal: signals,
    kind: DatumKind.signal,
  };

  datum.zones.values.push(zone);
}

/** calculate the missing projection
 * @param {string[]} nucleus
 */
export function getMissingProjection(datum, nucleus) {
  let index = datum.info.nucleus.indexOf(nucleus);
  // temporary because nuclus was undefined;
  if (index === -1) index = 0;

  let info = {
    nucleus: datum.info.nucleus[index], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  let from = index === 0 ? datum.data.minX : datum.data.minY;
  let to = index === 0 ? datum.data.maxX : datum.data.maxY;
  let nbPoints = index === 0 ? datum.data.z.length : datum.data.z[0].length;

  let projection = new Float64Array(nbPoints);
  if (index === 1) {
    for (let i = 0; i < datum.data.z.length; i++) {
      for (let j = 0; j < datum.data.z[0].length; j++) {
        projection[i] += datum.data.z[i][j];
      }
    }
  } else {
    for (let i = 0; i < datum.data.z[0].length; i++) {
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let j = 0; j < datum.data.z.length; j++) {
        projection[i] += datum.data.z[j][i];
      }
    }
  }

  let data = {
    x: zoneToX({ from, to }, nbPoints),
    re: projection,
  };
  const datum1D = initiateDatum1D({ info, data });
  return datum1D;
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
export function getDetectionZones(datum, options) {
  let dataMatrix = {};
  if (options.selectedZone) {
    dataMatrix = getSubMatrix(datum, options.selectedZone);
  } else {
    dataMatrix = datum.data;
  }
  options.info = datum.info;
  return autoZonesDetection(dataMatrix, options);
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
export function detectZones(datum, options) {
  const zones = getDetectionZones(datum, options);
  const formattedZones = zones.map((zone) => {
    return {
      id: generateID(),
      x: { from: zone.fromTo[0].from, to: zone.fromTo[0].to },
      y: { from: zone.fromTo[1].from, to: zone.fromTo[1].to },
      signal: [
        {
          id: generateID(),
          peak: zone.peaks,
          x: {
            delta: zone.shiftX,
            diaID: [],
          },
          y: {
            delta: zone.shiftY,
            diaID: [],
          },
          kind: 'signal',
        },
      ],
      kind: DatumKind.signal,
    };
  });
  datum.zones.values = datum.zones.values.concat(formattedZones);
}

export function getSubMatrix(datum, selectedZone) {
  const { fromX, toX, fromY, toY } = selectedZone;
  const data = datum.data;
  const xStep = (data.maxX - data.minX) / data.z[0].length;
  const yStep = (data.maxY - data.minY) / data.z.length;
  let xIndexFrom = Math.floor((fromX - data.minX) / xStep);
  let yIndexFrom = Math.floor((fromY - data.minY) / yStep);
  let xIndexTo = Math.floor((toX - data.minX) / xStep);
  let yIndexTo = Math.floor((toY - data.minY) / yStep);
  let dataMatrix: any = {
    z: [],
    maxX: data.minX + xIndexTo * xStep,
    minX: data.minX + xIndexFrom * xStep,
    maxY: data.minY + yIndexTo * yStep,
    minY: data.minY + yIndexFrom * yStep,
  };
  let maxZ = Number.MIN_SAFE_INTEGER;
  let minZ = Number.MAX_SAFE_INTEGER;

  let nbXPoints = xIndexFrom - xIndexTo + 1;
  for (let j = yIndexFrom; j < yIndexTo; j++) {
    let row = new Float32Array(nbXPoints);
    let xIndex = xIndexFrom;
    for (let i = 0; i < nbXPoints; i++) {
      row[i] = data.z[j][xIndex--];
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
