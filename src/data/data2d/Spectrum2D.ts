import { zoneToX } from 'ml-spectra-processing';

import { Filters } from '../Filters';
import * as FiltersManager from '../FiltersManager';
import { DatumKind } from '../constants/SignalsKinds';
import { Datum1D, initiateDatum1D } from '../data1d/Spectrum1D';
import generateID from '../utilities/generateID';
import { get2DColor } from '../utilities/getColor';

import Processing2D, { defaultContourOptions } from './Processing2D';
import autoZonesDetection from './autoZonesDetection';

export interface File {
  binary: ArrayBuffer;
  name: string;
  extension?: string;
}

export interface Source {
  jcampURL: string;
  file: File;
}

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
  experiment?: any;
}

export interface Signal {
  id: number;
  peak: any;
  x: Partial<{
    originDelta: number;
    delta: number;
    diaID: any;
  }>;
  y: Partial<{
    originDelta: number;
    delta: number;
    diaID: any;
  }>;
  kind: string;
}

export interface Zone {
  id: number;
  x: Partial<{ from: number; to: number }>;
  y: Partial<{ from: number; to: number }>;
  signal: Array<Signal>;
  kind: string;
}

export interface Zones {
  values: Array<Zone>;
  options?: { sum?: number };
}

export interface Datum2D {
  id: string;
  source: Source;
  display: Display;
  info: Info;
  originalInfo?: Info;
  meta: any;
  data: Data2D;
  originalData?: Data2D;
  zones: Zones;
  filters: Array<FiltersManager.Filter>;
  processingController: Processing2D;
}

export function initiateDatum2D(options: any, usedColors = {}): Datum2D {
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
      name: options.display?.name ? options.display.name : generateID(),
      positiveColor: 'red',
      negativeColor: 'blue',
      ...getColor(options, usedColors),
      isPositiveVisible: true,
      isNegativeVisible: true,
      isVisible: true,
      contourOptions: defaultContourOptions,
      dimension: 2,
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

  datum.originalInfo = datum.info;
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
  datum.originalData = datum.data;
  datum.filters = Object.assign([], options.filters);

  datum.zones = Object.assign({ values: [], options: {} }, options.zones);

  datum.processingController = new Processing2D(
    datum.data,
    datum.display.contourOptions,
  );

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(datum);

  return datum;
}

export function getShift(datum: Datum2D): { xShift: number; yShift: number } {
  let shift: any = { xShift: 0, yShift: 0 };
  if (datum?.filters) {
    shift = datum.filters.reduce(
      (acc, filter) => {
        if (filter.name === Filters.shift2DX.id) {
          acc.xShift = filter?.flag ? filter.value : 0;
        }
        if (filter.name === Filters.shift2DY.id) {
          acc.yShift = filter?.flag ? filter.value : 0;
        }
        return acc;
      },
      { xShift: 0, yShift: 0 },
    );
  }

  return shift;
}

function getColor(options, usedColors) {
  if (
    options.display === undefined ||
    options.display.negativeColor === undefined ||
    options.display.positiveColor === undefined
  ) {
    const color = get2DColor(options.info.experiment, usedColors['2d'] || []);
    if (usedColors['2d']) {
      usedColors['2d'].push(color.positiveColor);
    }
    return color;
  }
  return {};
}

export function toJSON(datum: Datum2D, forceIncludeData = true) {
  return {
    id: datum.id,
    source: {
      jcampURL: datum.source.jcampURL,
    },
    ...(forceIncludeData
      ? !datum.source.jcampURL
        ? {
            data: datum.originalData,
            info: datum.originalInfo,
            meta: datum.meta,
          }
        : {}
      : {}),
    zones: datum.zones,
    filters: datum.filters,
    display: datum.display,
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

  const horizontal = initiateDatum1D({ info: infoX, data: dataX }, {});
  const vertical = initiateDatum1D({ info: infoY, data: dataY }, {});
  return { horizontal, vertical };
}

export function updateShift(datum: Datum2D) {
  const { xShift, yShift } = getShift(datum);
  updateZonesShift(datum, {
    xShift,
    yShift,
  });
}

export function updateZonesShift(datum: Datum2D, { xShift, yShift }) {
  datum.zones.values = datum.zones.values.map((zone) => ({
    ...zone,
    signal: zone.signal?.map((signal) => ({
      ...signal,
      x: { ...signal.x, delta: signal.x.originDelta + xShift },
      y: { ...signal.y, delta: signal.y.originDelta + yShift },
    })),
  }));
}

/**
 *
 * @param {number} zoneID
 * @param {object} signal
 * @param {number} signal.x
 * @param {number} signal.y
 * @param {string} signal.id
 */
export function changeZoneSignal(
  datum,
  zoneID,
  newSignal,
): { xShift: number; yShift: number } {
  const zoneIndex = datum.zones.values.findIndex((zone) => zone.id === zoneID);
  if (zoneIndex !== -1) {
    const signalIndex = datum.zones.values[zoneIndex].signal.findIndex(
      (s) => s.id === newSignal.id,
    );
    if (signalIndex !== -1) {
      const originalSignal = datum.zones.values[zoneIndex].signal[signalIndex];
      const xShift =
        newSignal?.x || newSignal?.x === 0
          ? newSignal.x - originalSignal.x.delta
          : 0;
      const yShift =
        newSignal?.y || newSignal?.y === 0
          ? newSignal.y - originalSignal.y.delta
          : 0;

      return { xShift, yShift };
    }
  }
  return { xShift: 0, yShift: 0 };
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
  const signals = getDetectionZones(datum, options);
  const { xShift, yShift } = getShift(datum);
  for (let signal of signals) {
    let { fromTo } = signal;
    datum.zones.values.push({
      id: generateID(),
      x: fromTo[0],
      y: fromTo[1],
      signal: [
        {
          id: generateID(),
          peak: signal.peaks,
          x: {
            originDelta: signal.shiftX - xShift,
            delta: signal.shiftX,
            diaID: [],
          },
          y: {
            originDelta: signal.shiftY - yShift,
            delta: signal.shiftY,
            diaID: [],
          },
          kind: 'signal',
        },
      ],
      kind: DatumKind.signal,
    });
  }
}

/** calculate the missing projection
 * @param {string[]} nucleus
 */
export function getMissingProjection(datum, nucleus, usedColors) {
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
  let nbPoints = index === 0 ? datum.data.z[0].length : datum.data.z.length;
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
  const datum1D = initiateDatum1D({ info, data }, usedColors);
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
  const { xShift, yShift } = getShift(datum);

  const { minX, maxX, minY, maxY } = datum.data;
  const xError = Math.abs(maxX - minX) / 10000;
  const yError = Math.abs(maxY - minY) / 10000;

  const formattedZones = zones.reduce((acc, zone) => {
    const [newXRange, newYRange] = zone.fromTo;

    // check if the zone is already exists
    for (const { x, y } of datum.zones.values) {
      if (
        Math.abs(newXRange.from - x.from) < xError &&
        Math.abs(newXRange.to - x.to) < xError &&
        Math.abs(newYRange.from - y.from) < yError &&
        Math.abs(newYRange.to - y.to) < yError
      ) {
        return acc;
      }
    }

    acc.push({
      id: generateID(),
      x: { from: newXRange.from, to: newXRange.to },
      y: { from: newYRange.from, to: newYRange.to },
      signal: [
        {
          id: generateID(),
          peak: zone.peaks,
          x: {
            originDelta: zone.shiftX - xShift,
            delta: zone.shiftX,
            diaID: [],
          },
          y: {
            originDelta: zone.shiftY - yShift,
            delta: zone.shiftY,
            diaID: [],
          },
          kind: 'signal',
        },
      ],
      kind: DatumKind.signal,
    });

    return acc;
  }, []);
  datum.zones.values = datum.zones.values.concat(formattedZones);
}

export function getSubMatrix(datum, selectedZone) {
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

export function isSpectrum2D(spectrum: Datum1D | Datum2D): spectrum is Datum2D {
  return spectrum.info.dimension === 2;
}
