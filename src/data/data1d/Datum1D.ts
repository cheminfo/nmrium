import max from 'ml-array-max';
import { xyIntegration } from 'ml-spectra-processing';

import { SignalKindsToInclude } from '../constants/SignalsKinds';
import generateID from '../utilities/generateID';
import get1dColor from '../utilities/getColor';

import * as FiltersManager from './FiltersManager';
import { Filters as FiltersTypes } from './filter1d/Filters';

export const usedColors1D: Array<string> = [];

export interface Data1D {
  x: Array<number>;
  re: Array<number>;
  im: Array<number>;
}

export interface Display {
  name: string;
  color: string;
  isVisible: boolean;
  isPeaksMarkersVisible: boolean;
  isRealSpectrumVisible: boolean;
  isVisibleInDomain: boolean;
}

export interface Info {
  nucleus: Array<string>;
  isFid: boolean;
  isComplex: boolean;
  dimension: number;
  isFt: boolean;
}
export interface Peaks {
  values: Array<
    Partial<{
      id: string;
      xIndex: number;
      width: number;
    }>
  >;
  options?: any;
}
export interface Integrals {
  values: Array<
    Partial<{
      id: string;
      from: number;
      to: number;
      absolute: number;
      integral: number;
      kind: string;
    }>
  >;
  options?: Partial<{ sum: number }>;
}
export interface Ranges {
  values: Array<
    Partial<{
      id: string;
      from: number;
      to: number;
      absolute: number;
      integral: number;
      kind: string;
      signal?: Array<
        Partial<{
          id: string;
          kind: string;
          delta: number;
          multiplicity: string;
          peak?: Array<
            Partial<{ x: number; intensity: number; width: number }>
          >;
        }>
      >;
    }>
  >;
  options?: Partial<{ sum: number }>;
}

export type Filters = Array<
  Partial<{ name: string; isDeleteAllow: boolean; options?: any }>
>;

export interface Datum1D {
  id: string;
  source: Partial<{ jcamp: string; jcampURL: string; original: Data1D }>;
  display: Display;
  info: Partial<Info>;
  originalInfo: Partial<Info>;
  meta: any;
  data: Data1D;
  peaks: Peaks;
  integrals: Integrals;
  ranges: Ranges;
  filters: Filters;
}

export function initiateDatum1D(options: Datum1D): Datum1D {
  const data: any = {};

  data.id = options.id || generateID();
  data.source = Object.assign(
    {
      jcamp: null,
      jcampURL: null,
      original: [],
    },
    options.source,
  );
  data.display = Object.assign(
    {
      name: options.display?.name ? options.display.name : generateID(),
      color: 'black',
      ...getColor(options),
      isVisible: true,
      isPeaksMarkersVisible: true,
      isRealSpectrumVisible: true,
      isVisibleInDomain: true,
    },
    options.display,
  );

  data.info = Object.assign(
    {
      nucleus: '1H', // 1H, 13C, 19F, ...
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    },
    options.info,
  );

  data.originalInfo = Object.assign(
    {
      nucleus: '1H', // 1H, 13C, 19F, ...
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    },
    options.info,
  );

  data.meta = Object.assign({}, options.meta);
  data.data = Object.assign(
    {
      x: [],
      re: [],
      im: [],
      y: [],
    },
    options.data,
  );

  data.peaks = Object.assign({ values: [], options: {} }, options.peaks);
  // array of object {index: xIndex, xShift}
  // in case the peak does not exactly correspond to the point value
  // we can think about a second attributed `xShift`
  data.integrals = Object.assign(
    { values: [], options: { sum: 100 } },
    options.integrals,
  ); // array of object (from: xIndex, to: xIndex)
  data.filters = Object.assign([], options.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }
  data.ranges = Object.assign(
    { values: [], options: { sum: 100 } },
    options.ranges,
  );

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(data);

  preprocessing(data);
  data.data.y = data.data.re;
  return data;
}

function preprocessing(data) {
  if (
    data.info.isFid &&
    data.filters.findIndex((f) => f.name === FiltersTypes.digitalFilter.id) ===
      -1
  ) {
    FiltersManager.applyFilter(data, [
      {
        name: FiltersTypes.digitalFilter.id,
        options: {
          digitalFilterValue: data.info.digitalFilter,
        },
        isDeleteAllow: false,
      },
    ]);
  }
}

export function toJSON(datum1D: Datum1D) {
  return {
    data: datum1D.data,
    id: datum1D.id,
    source: {
      jcamp: datum1D.source.jcamp,
      jcampURL: datum1D.source.jcampURL,
      original:
        datum1D.source.jcampURL || datum1D.source.jcamp
          ? []
          : datum1D.source.original,
    },
    display: datum1D.display,
    info: datum1D.originalInfo,
    meta: datum1D.meta,
    peaks: datum1D.peaks,
    integrals: datum1D.integrals,
    ranges: datum1D.ranges,
    filters: datum1D.filters,
  };
}

function getColor(options) {
  if (options.display === undefined || options.display.color === undefined) {
    const color = get1dColor(false, usedColors1D);
    usedColors1D.push(color);
    return { color };
  }
  return {};
}

// with mouse move
/**
 *
 * @param {object<{x:Array<number>,re:Array<number>}>} data
 * @param  {object<{from:number,to:number}>} options
 */
export function lookupPeak(data, options) {
  const { from, to } = options;
  let minIndex = data.x.findIndex((number) => number >= from);
  let maxIndex = data.x.findIndex((number) => number >= to) - 1;

  if (minIndex > maxIndex) {
    minIndex = maxIndex;
    maxIndex = minIndex;
  }
  const dataRange = data.re.slice(minIndex, maxIndex);
  if (dataRange && dataRange.length > 0) {
    const yValue = max(dataRange);
    const xIndex = dataRange.findIndex((value) => value === yValue);
    const xValue = data.x[minIndex + xIndex];

    return { x: xValue, y: yValue, xIndex: minIndex + xIndex };
  }
  return null;
}

export function getIntegration(data, { from, to }) {
  return xyIntegration({ x: data.x, y: data.re }, { from, to, reverse: true });
}

export function updateIntegralIntegrals(integrals) {
  if (integrals.options.sum === undefined) {
    integrals.options = { ...integrals.options, sum: 100 };
  }
  const countingCondition = (integral) => {
    return integral.kind && SignalKindsToInclude.includes(integral.kind);
  };
  integrals.values = updateRelatives(
    integrals.values.slice(),
    integrals.options.sum,
    'integral',
    countingCondition,
  );
}

export function updateRelatives(values, sum, storageKey, countingCondition) {
  const currentSum = values.reduce((previous, current) => {
    return countingCondition !== undefined &&
      countingCondition(current) === true
      ? (previous += Math.abs(current.absolute))
      : previous;
  }, 0);
  const factor = currentSum > 0 ? sum / currentSum : 0.0;
  return values.map((value) => {
    return { ...value, [storageKey]: value.absolute * factor };
  });
}

export function changeIntegralsRealtive(integrals, id, newIntegralValue) {
  const integral = integrals.values.find((integral) => integral.id === id);
  if (integral) {
    const ratio = integral.absolute / newIntegralValue;
    const { values, sum } = integrals.values.reduce(
      (acc, integral, index) => {
        const newIntegralValue = integral.absolute / ratio;
        acc.sum += newIntegralValue;
        acc.values[index] = {
          ...integral,
          integral: newIntegralValue,
        };

        return acc;
      },
      { values: [], sum: 0 },
    );

    integrals.values = values;
    integrals.options.sum = sum;
  }
}
