import lodash from 'lodash';
import max from 'ml-array-max';
import { xyIntegration } from 'ml-spectra-processing';

import {
  SignalKindsToInclude,
  DatumKind,
} from '../../component/panels/extra/constants/SignalsKinds';
import { checkSignalKinds } from '../../component/panels/extra/utilities/RangeUtilities';
import generateID from '../utilities/generateID';

import { FiltersManager } from './FiltersManager';
import autoPeakPicking from './autoPeakPicking';
import autoRangesDetection from './autoRangesDetection';
import detectSignal from './detectSignal';
import { Filters } from './filter1d/Filters';

export class Datum1D {
  /**
   *
   * @param {object} options {display: {name, color, isVisible, isPeaksMarksVisible, ...}, meta: {isFid, nucleus}, ... }
   */
  constructor(options = {}) {
    this.id = options.id || generateID();
    this.source = Object.assign(
      {
        jcamp: null,
        jcampURL: null,
        original: [],
      },
      options.source,
    );
    this.display = Object.assign(
      {
        name:
          options.display && options.display.name
            ? options.display.name
            : generateID(),
        color: 'black',
        isVisible: true,
        isPeaksMarkersVisible: true,
        isRealSpectrumVisible: true,
        isVisibleInDomain: true,
      },
      options.display,
    );
    // this.original = options.data; //{ x, re, im }
    this.info = Object.assign(
      {
        nucleus: '1H', // 1H, 13C, 19F, ...
        isFid: false,
        isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      },
      options.info,
    );

    this.originalInfo = Object.assign(
      {
        nucleus: '1H', // 1H, 13C, 19F, ...
        isFid: false,
        isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      },
      options.info,
    );
    this.meta = Object.assign({}, options.meta);
    this.data = Object.assign(
      {
        x: [],
        re: [],
        im: [],
      },
      options.data,
    );
    this.peaks = Object.assign({ values: [], options: {} }, options.peaks);
    // array of object {index: xIndex, xShift}
    // in case the peak does not exactly correspond to the point value
    // we can think about a second attributed `xShift`
    this.integrals = Object.assign(
      { values: [], options: { sum: 100 } },
      options.integrals,
    ); // array of object (from: xIndex, to: xIndex)
    this.filters = Object.assign([], options.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }
    this.ranges = Object.assign(
      { values: [], options: { sum: 100 } },
      options.ranges,
    );

    //reapply filters after load the original data
    FiltersManager.reapplyFilters(this);

    this.preprocessing();
  }

  reapplyFilters() {
    FiltersManager.reapplyFilters(this);
  }

  applyFilterSnapshot(id) {
    if (id) {
      const index = this.filters.findIndex((f) => f.id === id);
      const filters = this.filters.slice(0, index + 1);
      FiltersManager.reapplyFilters(this, filters);
    } else {
      //close filter snapshot mode and replay all enabled filters
      FiltersManager.reapplyFilters(this);
    }
  }

  preprocessing() {
    if (
      this.info.isFid &&
      this.filters.findIndex((f) => f.name === Filters.digitalFilter.id) === -1
    ) {
      this.applyFilter([
        {
          name: Filters.digitalFilter.id,
          options: {
            digitalFilterValue: this.info.digitalFilter,
          },
          isDeleteAllow: false,
        },
      ]);
    }
  }

  setIsRealSpectrumVisible(isVisible) {
    this.isRealSpectrumVisible = isVisible;
  }

  setPeaks(peaks) {
    this.peaks = peaks;
  }

  getPeaks() {
    return this.peaks;
  }

  setRanges(ranges) {
    this.ranges = ranges;
    this.updateIntegralRanges();
  }

  setRange(data) {
    const RangeIndex = this.ranges.values.findIndex(
      (range) => range.id === data.id,
    );
    this.ranges.values[RangeIndex] = data;
    this.updateIntegralRanges();
  }

  getRanges() {
    return lodash.cloneDeep(this.ranges);
  }

  /**
   * Calculates the integral for a range
   * @param {*} range
   */
  addIntegral(range = []) {
    const integral = {
      id: generateID(),
      from: range[0],
      to: range[1],
      absolute: this.getIntegration(range[0], range[1]), // the real value
      kind: 'signal',
    };
    this.integrals.values.push(integral);
    this.updateIntegralIntegrals();
  }

  getIntegration(from, to) {
    return xyIntegration(
      { x: this.data.x, y: this.data.re },
      { from, to, reverse: true },
    );
  }

  /**
   * Set the new integral
   */
  changeIntegralSum(sumValue) {
    this.integrals.options = { ...this.integrals.options, sum: sumValue };
    this.updateIntegralIntegrals();
  }

  changeRangesSum(sumValue) {
    this.ranges.options = { ...this.ranges.options, sum: sumValue };

    this.updateIntegralRanges();
  }

  changeRangesRealtive(rangeID, newRealtiveValue) {
    const range = this.ranges.values.find((range) => range.id === rangeID);
    if (range) {
      const ratio = range.absolute / newRealtiveValue;
      this.ranges.values = this.ranges.values.map((range) => {
        return {
          ...range,
          integral: range.absolute / ratio,
        };
      });
    }
    return this.ranges.values;
  }
  changeInetgralsRealtive(integralID, newIntegralValue) {
    const integral = this.integrals.values.find(
      (integral) => integral.id === integralID,
    );
    if (integral) {
      const ratio = integral.absolute / newIntegralValue;
      this.integrals.values = this.integrals.values.map((integral) => {
        return {
          ...integral,
          integral: integral.absolute / ratio,
        };
      });
    }
    return this.integrals.values;
  }

  updateIntegralIntegrals() {
    if (this.integrals.options.sum === undefined) {
      this.integrals.options = { ...this.integrals.options, sum: 100 };
    }
    const countingCondition = (integral) => {
      return integral.kind && SignalKindsToInclude.includes(integral.kind);
    };
    this.integrals.values = this.updateRelatives(
      this.integrals.values.slice(),
      this.integrals.options.sum,
      'integral',
      countingCondition,
    );
  }

  updateIntegralRanges() {
    if (this.ranges.options.sum === undefined) {
      this.ranges.options = { ...this.ranges.options, sum: 100 };
    }
    const countingCondition = (range) => {
      return range.signal && checkSignalKinds(range, SignalKindsToInclude);
    };
    this.ranges.values = this.updateRelatives(
      this.ranges.values.slice(),
      this.ranges.options.sum,
      'integral',
      countingCondition,
    );
  }

  // this method is a helper method and can be moved and imported from somewhere else if wished
  updateRelatives(values, sum, storageKey, countingCondition) {
    const currentSum = values.reduce((previous, current) => {
      return countingCondition !== undefined &&
        countingCondition(current) === true
        ? (previous += current.absolute)
        : previous;
    }, 0);
    const factor = currentSum > 0 ? sum / currentSum : 0.0;
    return values.map((value) => {
      return { ...value, [storageKey]: value.absolute * factor };
    });
  }

  changeIntegral(integral) {
    const index = this.integrals.values.findIndex((i) => i.id === integral.id);
    if (index !== -1) {
      this.integrals.values[index] = {
        ...this.integrals.values[index],
        ...integral,
        ...{ absolute: this.getIntegration(integral.from, integral.to) },
      };
      this.updateIntegralIntegrals();
    }
  }

  getIntegrals() {
    return lodash.cloneDeep(this.integrals);
  }

  getInfo() {
    return this.info;
  }

  baseline() {
    // let result = baseline(this.data.x, this.data.re, this.data.im);
  }

  applyAutoPeakPicking(options) {
    const peaks = autoPeakPicking(this, options);
    this.peaks.values = peaks;
    return this.peaks.values;
  }

  detectRanges(options) {
    const ranges = autoRangesDetection(this, options);
    this.ranges.values = ranges.map((range) => {
      return {
        kind: DatumKind.signal,
        ...range,
        id: generateID(),
        absolute: this.getIntegration(range.from, range.to),
        signal: range.signal.map((_signal) => {
          return { kind: 'signal', ..._signal };
        }),
      };
    });
    this.updateIntegralRanges();

    return lodash.cloneDeep(this.ranges);
  }

  deletePeak(peak) {
    if (peak == null) {
      this.peaks.values = [];
    } else {
      this.peaks.values = this.peaks.values.filter(
        (p) => p.xIndex !== peak.xIndex,
      );
    }
    return this.peaks.values.slice();
  }

  deleteRange(id) {
    this.ranges = Object.assign({}, this.ranges);
    this.ranges.values = this.ranges.values.slice();
    if (id === undefined) {
      this.ranges.values = [];
    } else {
      this.ranges.values = this.ranges.values.filter(
        (range) => range.id !== id,
      );
    }
    this.updateIntegralRanges();
  }
  deleteIntegral(id) {
    if (id == null) {
      this.integrals.values = [];
    } else {
      this.integrals.values = this.integrals.values.filter(
        (integral) => integral.id !== id,
      );
    }
    this.updateIntegralIntegrals();
    return this.integrals.values.slice();
  }

  setIntegral(data) {
    const integralIndex = this.integrals.values.findIndex(
      (integral) => integral.id === data.id,
    );
    this.integrals.values[integralIndex] = data;
    this.updateIntegralIntegrals();
  }

  /***
   * @param {object} Filters [{name:'',options:{}},{...}]
   */

  applyFilter(filters = []) {
    FiltersManager.applyFilter(this, filters);
  }

  // id filter id
  enableFilter(id, checked) {
    FiltersManager.enableFilter(this, id, checked);
  }
  deleteFilter(id) {
    FiltersManager.deleteFilter(this, id);
  }

  getReal() {
    return {
      x: this.data.x,
      y: this.data.re,
    };
  }

  getImaginary() {
    return {
      x: this.data.x,
      y: this.data.im,
    };
  }

  getData() {
    return this.data;
  }

  // with mouse move
  lookupPeak(from, to) {
    let minIndex = this.data.x.findIndex((number) => number >= from);
    let maxIndex = this.data.x.findIndex((number) => number >= to) - 1;

    if (minIndex > maxIndex) {
      minIndex = maxIndex;
      maxIndex = minIndex;
    }
    const dataRange = this.data.re.slice(minIndex, maxIndex);
    if (dataRange && dataRange.length > 0) {
      const yValue = max(dataRange);
      const xIndex = dataRange.findIndex((value) => value === yValue);
      const xValue = this.data.x[minIndex + xIndex];

      return { x: xValue, y: yValue, xIndex: minIndex + xIndex };
    }
    return null;
  }
  /**
   *
   * @param {number} chemicalShift Target chemical shift
   * @param {number} window Range of chemical shifts to look for
   * @example  addPeak(5, 0.1)
   */
  // addPeak(from, to, options = {}) {
  //   // we look for the highest peak in the zone
  //   // return one peak
  //   // this.lookupPeak();
  //   // add peak in this.peaks
  // }

  checkPeakIsExists(peak) {
    const peaks = this.peaks.values.map((p) => p.xIndex);
    if (peaks.includes(peak.xIndex)) {
      return true;
    }
    return false;
  }

  detectSignal(from, to) {
    return detectSignal(
      this.data.x,
      this.data.re,
      from,
      to,
      this.info.originFrequency,
    );
  }

  addRange(from, to) {
    try {
      let range = {
        id: generateID(),
        from,
        to,
        absolute: this.getIntegration(from, to), // the real value,
        signal: [this.detectSignal(from, to)],
        kind: DatumKind.signal,
      };
      this.ranges.values.push(range);
      this.updateIntegralRanges();
    } catch (e) {
      throw new Error('Could not calculate the multiplicity');
    }
  }

  changeRange(range) {
    const index = this.ranges.values.findIndex((i) => i.id === range.id);
    if (index !== -1) {
      this.ranges.values[index] = {
        ...this.ranges.values[index],
        ...range,
        ...{ absolute: this.getIntegration(range.from, range.to) },
      };
      this.updateIntegralRanges();
    }
  }

  addPeak(peak) {
    if (!this.checkPeakIsExists(peak)) {
      const newPeak = {
        id: generateID(),
        ...peak,
      };
      this.peaks.values.push(newPeak);
      return newPeak;
    }

    return null;
  }

  // Add all the peaks in a range
  // click / drag / release
  addPeaks(from, to) {
    // we look for the highest peak in the zone for now
    // but it returns an array !
    // for now you return an array containing the result of addPeak
    if (from !== to) {
      const peak = this.lookupPeak(from, to);
      if (peak && !this.checkPeakIsExists(peak)) {
        const newPeak = { id: generateID(), ...peak };
        this.peaks.values.push(newPeak);
        return newPeak;
      }
    }
    return null;
  }

  addFilter(filter) {
    FiltersManager.addFilter(this, filter);
  }

  getFilters() {
    return this.filters;
  }

  setDisplay(displayOptions) {
    this.display = Object.assign({}, this.display);
    this.display = { ...this.display, ...displayOptions };
  }

  toJSON() {
    return {
      data: this.data,
      id: this.id,
      source: {
        jcamp: this.source.jcamp,
        jcampURL: this.source.jcampURL,
        original:
          this.source.jcampURL || this.source.jcamp ? [] : this.source.original,
      },
      display: this.display,
      info: this.originalInfo,
      meta: this.meta,
      peaks: this.peaks,
      integrals: this.integrals,
      ranges: this.ranges,
      filters: this.filters,
    };
  }
}
