import merge from 'lodash/merge';
import max from 'ml-array-max';
import {
  xyIntegration,
  xyMinYPoint,
  xyMaxYPoint,
  xFindClosestIndex,
} from 'ml-spectra-processing';
import { resurrect, rangesToXY } from 'nmr-processing';

import { UsedColors } from '../../types/UsedColors';
import * as FiltersTypes from '../Filters';
import * as FiltersManager from '../FiltersManager';
import { DataExportOptions, DataExportOptionsType } from '../SpectraManager';
import { DatumKind, SignalKindsToInclude } from '../constants/SignalsKinds';
import {
  Datum1D,
  Integral,
  Range,
  RangeDetectionResult,
} from '../types/data1d';
import { Datum2D } from '../types/data2d';
import { checkSignalKinds } from '../utilities/RangeUtilities';
import generateID from '../utilities/generateID';
import get1dColor from '../utilities/getColor';

import autoRangesDetection from './autoRangesDetection';
import detectSignal from './detectSignal';

export function initiateDatum1D(options: any, usedColors = {}): Datum1D {
  const datum: any = {};
  datum.id = options.id || generateID();
  datum.source = Object.assign(
    {
      jcampURL: null,
      file: {
        binary: null,
        name: '',
        extension: '',
      },
    },
    options.source,
  );

  datum.display = Object.assign(
    {
      name: options.display?.name ? options.display.name : generateID(),
      ...getColor(options, usedColors),
      isVisible: true,
      isPeaksMarkersVisible: true,
      isRealSpectrumVisible: true,
    },
    options.display,
  );

  datum.info = Object.assign(
    {
      nucleus: '1H', // 1H, 13C, 19F, ...
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      dimension: 1,
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
    },
    options.data,
  );
  datum.originalData = datum.data;

  datum.peaks = Object.assign({ values: [], options: {} }, options.peaks);
  // array of object {index: xIndex, xShift}
  // in case the peak does not exactly correspond to the point value
  // we can think about a second attributed `xShift`
  datum.integrals = merge(
    { values: [], options: { sum: 100, isSumConstant: true } },
    options.integrals,
  ); // array of object (from: xIndex, to: xIndex)
  datum.filters = Object.assign([], options.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }
  datum.ranges = merge(
    { values: [], options: { sum: 100, isSumConstant: true } },
    options.ranges,
  );

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(datum);

  preprocessing(datum);
  return datum;
}

function preprocessing(datum) {
  if (
    datum.info.isFid &&
    datum.filters.findIndex((f) => f.name === FiltersTypes.digitalFilter.id) ===
      -1 &&
    datum.info.digitalFilter
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

export function toJSON(
  datum1D: Datum1D,
  dataExportOption: DataExportOptionsType,
) {
  return {
    id: datum1D.id,
    display: datum1D.display,
    ...(dataExportOption === DataExportOptions.ROW_DATA ||
    (dataExportOption === DataExportOptions.DATA_SOURCE &&
      !datum1D.source.jcampURL)
      ? {
          data: datum1D.originalData,
          info: datum1D.originalInfo,
          meta: datum1D.meta,
          source: {
            jcampURL: null,
          },
        }
      : {
          source: {
            jcampURL: datum1D.source.jcampURL,
          },
        }),
    peaks: datum1D.peaks,
    integrals: datum1D.integrals,
    ranges: datum1D.ranges,
    filters: datum1D.filters,
  };
}

function getColor(options, usedColors) {
  let color = 'black';
  if (options.display === undefined || options.display.color === undefined) {
    color = get1dColor(false, usedColors['1d'] || []);
  }

  if (usedColors['1d']) {
    usedColors['1d'].push(color);
  }

  return { color };
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

export function updateIntegralIntegrals(datum, forceCalculateIntegral = false) {
  updateRelatives(
    datum.integrals,
    'integral',
    integralCountingCondition,
    forceCalculateIntegral,
  );
}

export function changeIntegralsRealtive(datum, newIntegral) {
  const index = datum.integrals.values.findIndex(
    (integral) => integral.id === newIntegral.id,
  );
  if (index !== -1) {
    const ratio = datum.integrals.values[index].absolute / newIntegral.value;
    const { values, sum } = datum.integrals.values.reduce(
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

    datum.integrals.values = values;
    datum.integrals.options.sum = sum;
  }
}

function getSum(values, key, countingCondition) {
  return values.reduce((previous, current) => {
    return countingCondition && countingCondition(current) === true
      ? (previous += Math.abs(current[key]))
      : previous;
  }, 0);
}

export function integralCountingCondition(integral: Integral) {
  return integral.kind && SignalKindsToInclude.includes(integral.kind);
}

function rangeCountingCondition(range: Range) {
  return range.signals && checkSignalKinds(range, SignalKindsToInclude);
}

function updateRelatives(
  data,
  storageKey,
  countingCondition,
  forceCalculateIntegral = false,
) {
  const { values, options } = data;

  const currentSum = getSum(values, 'absolute', countingCondition);

  let factor = 0;
  if (data.options.isSumConstant || forceCalculateIntegral) {
    factor = currentSum > 0 ? options.sum / currentSum : 0.0;
  } else {
    if (data.values?.[0]) {
      const { [storageKey]: integral, absolute } = data.values[0];
      factor = (integral ? integral : options.sum) / absolute;
    }
  }

  data.values = data.values.map((value) => {
    return {
      ...value,
      ...(countingCondition(value) && {
        [storageKey]: value.absolute * factor,
      }),
    };
  });

  if (!data.options.isSumConstant && !forceCalculateIntegral) {
    data.options.sum = getSum(data.values, storageKey, countingCondition);
  }
}

export function updateIntegralRanges(datum, forceCalculateIntegral = false) {
  updateRelatives(
    datum.ranges,
    'integration',
    rangeCountingCondition,
    forceCalculateIntegral,
  );
}

export function detectRange(datum, options): RangeDetectionResult {
  const { from, to } = options;
  const { x, re: y } = datum.data;

  const absolute = xyIntegration({ x, y }, { from, to, reverse: true });
  const min = xyMinYPoint({ x, y }, { from, to }).y;
  const max = xyMaxYPoint({ x, y }, { from, to }).y;

  const shiftX = getShiftX(datum);

  return {
    id: generateID(),
    originFrom: from - shiftX,
    originTo: to - shiftX,
    from,
    to,
    absolute, // the real value,
    min,
    max,
  };
}

export function mapRanges(ranges: Array<Range>, datum) {
  const { x, re } = datum.data;
  const shiftX = getShiftX(datum);
  const error = (x[x.length - 1] - x[0]) / 10000;
  return ranges.reduce<Array<Range>>((acc, newRange) => {
    // check if the range is already exists
    for (const { from, to } of datum.ranges.values) {
      if (
        Math.abs(newRange.from - from) < error &&
        Math.abs(newRange.to - to) < error
      ) {
        return acc;
      }
    }

    const absolute = xyIntegration(
      { x, y: re },
      { from: newRange.from, to: newRange.to, reverse: true },
    );
    const signals = newRange.signals.map((signal) => {
      const { kind = null, id, ...resSignal } = signal;
      return {
        kind: kind || 'signal',
        id: id || generateID(),
        originDelta: signal.delta - shiftX,
        ...resSignal,
      };
    });

    acc.push({
      ...newRange,
      kind: signals?.[0].kind || DatumKind.signal,
      originFrom: newRange.from - shiftX,
      originTo: newRange.to - shiftX,
      id: newRange.id || generateID(),
      absolute,
      signals,
    });

    return acc;
  }, []);
}

export function detectRanges(datum, options) {
  options.impurities = { solvent: datum.info.solvent };
  const ranges = autoRangesDetection(datum, options);

  datum.ranges.values = datum.ranges.values.concat(mapRanges(ranges, datum));
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
      originFrom: from,
      originTo: to,
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
      signals: [{ id: generateID(), ...signals }],
      kind: DatumKind.signal,
      integration: 0,
    };
    datum.ranges.values = datum.ranges.values.concat(mapRanges([range], datum));
    updateIntegralRanges(datum);
  } catch (e) {
    throw new Error('Could not calculate the multiplicity');
  }
}

export function updateXShift(datum: Datum1D) {
  const shiftX = getShiftX(datum);
  updatePeaksXShift(datum, shiftX);
  updateRangesXShift(datum, shiftX);
  updateIntegralXShift(datum, shiftX);
}

export function getShiftX(datum: Datum1D): number {
  const filter =
    datum?.filters &&
    datum?.filters.find((filter) => filter.name === FiltersTypes.shiftX.id);

  return filter?.flag ? filter.value : 0;
}

export function updatePeaksXShift(datum: Datum1D, shiftValue) {
  datum.peaks.values = datum.peaks.values.map((peak) => {
    const delta = peak.originDelta + shiftValue;
    const xIndex = xFindClosestIndex(datum.data.x, delta);
    return {
      ...peak,
      intensity: datum.data.re[xIndex],
      delta: peak.originDelta + shiftValue,
    };
  });
}
export function updateRangesXShift(datum: Datum1D, shiftValue) {
  datum.ranges.values = datum.ranges.values.map((range) => ({
    ...range,
    from: range.originFrom + shiftValue,
    to: range.originTo + shiftValue,
    signals:
      range?.signals &&
      range.signals.map((s) => ({ ...s, delta: s.originDelta + shiftValue })),
  }));
}
export function updateIntegralXShift(datum: Datum1D, shiftValue) {
  datum.integrals.values = datum.integrals.values.map((integral) => ({
    ...integral,
    from: integral.originFrom + shiftValue,
    to: integral.originTo + shiftValue,
  }));
}

export function changeRangesRelative(datum, newRange) {
  const index = datum.ranges.values.findIndex(
    (range) => range.id === newRange.id,
  );
  if (index !== -1) {
    const ratio = datum.ranges.values[index].absolute / newRange.value;
    datum.ranges.options.sum =
      (newRange.value / datum.ranges.values[index].integration) *
      datum.ranges.options.sum;
    datum.ranges.values = datum.ranges.values.map((range) => {
      return {
        ...range,
        integration: range.absolute / ratio,
      };
    });
  }
}

export function changeRangeSignal(datum, rangeID, signalID, newSignalValue) {
  let shiftValue = 0;
  const rangeIndex = datum.ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
  if (rangeIndex !== -1) {
    const signalIndex = datum.ranges.values[rangeIndex].signals.findIndex(
      (signal) => signal.id === signalID,
    );
    shiftValue =
      newSignalValue -
      datum.ranges.values[rangeIndex].signals[signalIndex].delta;
    datum.ranges.values[rangeIndex].signals[signalIndex].delta = newSignalValue;
  }
  return shiftValue;
}

export function generateSpectrumFromRanges(
  ranges,
  info: {
    nucleus: string;
    solvent: string;
    name?: string;
    frequency?: number;
    color?: string;
  },
  usedColors: UsedColors,
) {
  const { nucleus, solvent, name = null, frequency = 400 } = info;
  const { x, y } = rangesToXY(ranges, {
    frequency,
    nbPoints: 524288,
  });

  const datum = initiateDatum1D(
    {
      data: { x, im: null, re: y },
      display: { name },
      info: {
        nucleus,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: '',
        solvent,
        isFt: true,
      },
    },
    usedColors,
  );
  datum.ranges.values = mapRanges(ranges, datum);

  return datum;
}

export function generateSpectrumFromPublicationString(
  publicationString: string,
  usedColors: UsedColors,
) {
  const {
    ranges,
    experiment: { nucleus, solvent },
    parts,
  } = resurrect(publicationString);
  return generateSpectrumFromRanges(
    ranges,
    { nucleus, solvent, name: parts[0] },
    usedColors,
  );
}

export function isSpectrum1D(spectrum: Datum1D | Datum2D): spectrum is Datum1D {
  return spectrum.info.dimension === 1;
}
