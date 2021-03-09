import max from 'ml-array-max';
import { xyIntegration, xyMinYPoint, xyMaxYPoint } from 'ml-spectra-processing';

import { DatumKind, SignalKindsToInclude } from '../constants/SignalsKinds';
import { checkSignalKinds } from '../utilities/RangeUtilities';
import generateID from '../utilities/generateID';
import get1dColor from '../utilities/getColor';

import * as FiltersManager from './FiltersManager';
import autoRangesDetection from './autoRangesDetection';
import detectSignal from './detectSignal';
import { Filters as FiltersTypes } from './filter1d/Filters';

export const usedColors1D: Array<string> = [];

export interface Data1D {
  y: Array<number>;
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
export interface Peak {
  id: string;
  xIndex: number;
  width: number;
}
export interface Peaks {
  values: Array<Partial<Peak>>;
  options: any;
}
export interface Integral {
  id: string;
  from: number;
  to: number;
  absolute: number;
  integral: number;
  kind: string;
}
export interface Integrals {
  values: Array<Partial<Integral>>;
  options: Partial<{ sum: number }>;
}

export interface Signal {
  id: string;
  kind: string;
  delta: number;
  multiplicity: string;
  peak?: Array<Partial<{ x: number; intensity: number; width: number }>>;
}
export interface Range {
  id: string;
  from: number;
  to: number;
  absolute: number;
  integral: number;
  kind: string;
  signal?: Array<Partial<Signal>>;
}

export interface Ranges {
  values: Array<Partial<Range>>;
  options: Partial<{ sum: number }>;
}

export interface Filter {
  id: string;
  name: string;
  isDeleteAllow: boolean;
  options?: any;
}

export interface Source {
  jcamp: string;
  jcampURL: string;
  original: Data1D;
}

export interface Datum1D {
  id: string | number;
  source: Partial<Source>;
  display: Display;
  info: Partial<Info>;
  originalInfo?: Partial<Info>;
  meta: any;
  data: Data1D;
  originalData?: Data1D;
  peaks: Peaks;
  integrals: Integrals;
  ranges: Ranges;
  filters: Array<Partial<Filter>>;
}

export function initiateDatum1D(options: any): Datum1D {
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
      color: 'black',
      ...getColor(options),
      isVisible: true,
      isPeaksMarkersVisible: true,
      isRealSpectrumVisible: true,
      isVisibleInDomain: true,
    },
    options.display,
  );

  datum.info = Object.assign(
    {
      nucleus: '1H', // 1H, 13C, 19F, ...
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    },
    options.info,
  );

  datum.originalInfo = datum.info;

  datum.meta = Object.assign({}, options.meta);
  datum.data = Object.assign(
    {
      x: [],
      re: [],
      im: [],
      y: [],
    },
    options.data,
  );
  datum.originalData = datum.data;

  datum.peaks = Object.assign({ values: [], options: {} }, options.peaks);
  // array of object {index: xIndex, xShift}
  // in case the peak does not exactly correspond to the point value
  // we can think about a second attributed `xShift`
  datum.integrals = Object.assign(
    { values: [], options: { sum: 100 } },
    options.integrals,
  ); // array of object (from: xIndex, to: xIndex)
  datum.filters = Object.assign([], options.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }
  datum.ranges = Object.assign(
    { values: [], options: { sum: 100 } },
    options.ranges,
  );

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(datum);

  preprocessing(datum);
  (datum.data as Data1D).y = datum.data.re;
  return datum;
}

function preprocessing(datum) {
  if (
    datum.info.isFid &&
    datum.filters.findIndex((f) => f.name === FiltersTypes.digitalFilter.id) ===
      -1
  ) {
    FiltersManager.applyFilter(datum, [
      {
        name: FiltersTypes.digitalFilter.id,
        options: {
          digitalFilterValue: datum.info.digitalFilter,
        },
        isDeleteAllow: false,
      },
    ]);
  }
}

export function toJSON(datum1D: Datum1D) {
  const { re, im, y, x } = datum1D.originalData || {
    re: [],
    im: [],
    y: [],
    x: [],
  };
  return {
    data: {
      x: Array.from(x),
      re: Array.from(re),
      im: Array.from(im),
      y: Array.from(y),
    },
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

function updateRelatives(values, sum, storageKey, countingCondition) {
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

export function updateIntegralRanges(datum) {
  if (datum.ranges.options.sum === undefined) {
    datum.ranges.options.sum = 100;
  }
  const countingCondition = (range) => {
    return range.signal && checkSignalKinds(range, SignalKindsToInclude);
  };
  datum.ranges.values = updateRelatives(
    datum.ranges.values.slice(),
    datum.ranges.options.sum,
    'integral',
    countingCondition,
  );
}

export function detectRange(datum, options) {
  const { from, to } = options;
  const { x, re: y } = datum.data;

  const absolute = xyIntegration({ x, y }, { from, to, reverse: true });
  const min = xyMinYPoint({ x, y }, { from, to }).y;
  const max = xyMaxYPoint({ x, y }, { from, to }).y;

  return {
    id: generateID(),
    from,
    to,
    absolute, // the real value,
    min,
    max,
  };
}

export function detectRanges(datum, options) {
  const { x, re } = datum.data;
  options.impurities = { solvent: datum.info.solvent };
  const ranges = autoRangesDetection(datum, options);
  datum.ranges.values = datum.ranges.values.concat(
    ranges.map((range) => {
      const absolute = xyIntegration(
        { x, y: re },
        { from: range.from, to: range.to, reverse: true },
      );

      const signal = range.signal.map((_signal) => {
        return { kind: 'signal', id: generateID(), ..._signal };
      });

      return {
        kind: range.signal[0].kind || DatumKind.signal,
        ...range,
        id: generateID(),
        absolute,
        signal,
      };
    }),
  );
  updateIntegralRanges(datum);
}

export function changeRange(datum, range) {
  const { from, to } = range;
  const { x, re } = datum.data;

  const index = datum.ranges.values.findIndex((i) => i.id === range.id);
  const absolute = xyIntegration({ x, y: re }, { from, to, reverse: true });

  if (index !== -1) {
    datum.ranges.values[index] = {
      ...datum.ranges.values[index],
      ...range,
      absolute,
    };
    updateIntegralRanges(datum);
  }
}

export function addRange(datum, options) {
  const { from, to } = options;
  const { x, re } = datum.data;
  const absolute = xyIntegration({ x, y: re }, { from, to, reverse: true });

  const signals = detectSignal(x, re, from, to, datum.info.originFrequency);

  try {
    const range = {
      id: generateID(),
      from,
      to,
      absolute, // the real value,
      signal: [{ id: generateID(), ...signals }],
      kind: DatumKind.signal,
    };
    datum.ranges.values.push(range);

    updateIntegralRanges(datum);
  } catch (e) {
    throw new Error('Could not calculate the multiplicity');
  }
}

export function changeRangesRealtive(datum, rangeID, newRealtiveValue) {
  const range = datum.ranges.values.find((range) => range.id === rangeID);
  if (range) {
    const ratio = range.absolute / newRealtiveValue;
    datum.ranges.values = datum.ranges.values.map((range) => {
      return {
        ...range,
        integral: range.absolute / ratio,
      };
    });
  }
}

export function changeRangeSignal(datum, rangeID, signalID, newSignalValue) {
  const rangeIndex = datum.ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
  if (rangeIndex !== -1) {
    const signalIndex = datum.ranges.values[rangeIndex].signal.findIndex(
      (signal) => signal.id === signalID,
    );
    datum.ranges.values[rangeIndex].signal[signalIndex].delta = newSignalValue;
  }
}
