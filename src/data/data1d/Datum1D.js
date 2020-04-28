/* eslint-disable no-unused-vars */
// import baseline from './baseline';
import max from 'ml-array-max';
import equallySpaced from 'ml-array-xy-equally-spaced';
import { XY, X } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';

import generateID from '../utilities/generateID';

import { FiltersManager } from './FiltersManager';
import autoPeakPicking from './autoPeakPicking';
import autoRangesDetection from './autoRangesDetection';
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
    this.peaks = Object.assign({ values: [], options: {} }, options.peaks); // array of object {index: xIndex, xShift}
    // in case the peak does not exactly correspond to the point value
    // we can think about a second attributed `xShift`
    this.integrals = Object.assign(
      { values: [], options: {} },
      options.integrals,
    ); // array of object (from: xIndex, to: xIndex)
    this.filters = Object.assign([], options.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }
    this.ranges = Object.assign({ values: [], options: {} }, options.ranges);

    //reapply filters after load the original data
    FiltersManager.reapplyFilters(this);

    this.preprocessing();
  }

  reapplyFilters() {
    FiltersManager.reapplyFilters(this);
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
            dspfvs: this.info.dspfvs,
            decim: this.info.decim,
            grpdly: this.info.grpdly,
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
  }

  setRange(data) {
    this.ranges = Object.assign({}, this.ranges);
    this.ranges.values = this.ranges.values.slice();
    const RangeIndex = this.ranges.values.findIndex(
      (range) => range.id === data.id,
    );
    this.ranges.values[RangeIndex] = data;
  }

  getRanges() {
    return this.ranges;
  }

  getRangeAbsolute(from, to) {
    return this.getIntegration(from, to);
  }
  getRangeIntegral(from, to) {
    return 0;
  }

  resizeRange(range) {
    this.ranges = Object.assign({}, this.ranges);
    this.ranges.values = this.ranges.values.slice();
    const index = this.ranges.values.findIndex((i) => i.id === range.id);
    if (index !== -1) {
      this.ranges.values[index] = {
        ...this.ranges.values[index],
        ...range,
        ...{ absolute: this.getRangeAbsolute(range.from, range.to) },
        ...{ integral: this.getRangeIntegral(range.from, range.to) },
      };
    }
  }

  /**
   * Calculates the integral for a range
   * @param {*} range
   */
  addIntegral(range = []) {
    this.integrals = Object.assign({}, this.integrals);
    this.integrals.values = this.integrals.values.slice();
    this.integrals.values.push({
      id: generateID(),
      from: range[0],
      to: range[1],
      value: this.getIntegration(range[0], range[1]), // the real value
      relative: 0, // relative value
      kind: 'signal',
    });
    this.updateRelativeIntegrals();
  }

  getIntegration(from, to) {
    return XY.integration(
      { x: this.data.x, y: this.data.re },
      { from, to, reverse: true },
    );
  }

  /**
   * Set the new integral
   */
  changeIntegralSum(sumValue) {
    this.integrals = Object.assign({}, this.integrals);
    this.integrals.options = { ...this.integrals.options, sum: sumValue };
    this.updateRelativeIntegrals();
  }

  changeRangesSum(sumValue) {
    this.ranges = Object.assign({}, this.ranges);
    this.ranges.values = this.ranges.values.slice();
    this.ranges.options = { ...this.ranges.options, sum: sumValue };
    let currentSum = this.ranges.values.reduce(
      (previous, current) => (previous += current.absolute),
      0,
    );
    let factor = sumValue / currentSum;
    this.ranges.values = this.ranges.values.map((range) => {
      const integral = range.absolute * factor;
      return { ...range, integral };
    });
  }

  updateRelativeIntegrals() {
    const sum = this.integrals.options.sum || 100;
    this.integrals = Object.assign({}, this.integrals);
    this.integrals.values = this.integrals.values.slice();
    let currentSum = this.integrals.values.reduce(
      (previous, current) => (previous += current.value),
      0,
    );
    let factor = sum / currentSum;
    this.integrals.values = this.integrals.values.map((integral) => {
      const relative = integral.value * factor;
      return { ...integral, relative };
    });
  }

  changeIntegral(integral) {
    this.integrals = Object.assign({}, this.integrals);
    this.integrals.values = this.integrals.values.slice();
    const index = this.integrals.values.findIndex((i) => i.id === integral.id);
    if (index !== -1) {
      this.integrals.values[index] = {
        ...this.integrals.values[index],
        ...integral,
        ...{ value: this.getIntegration(integral.from, integral.to) },
      };
      this.updateRelativeIntegrals();
    }
  }

  getIntegrals() {
    return this.integrals;
  }

  getInfo() {
    return this.info;
  }

  baseline() {
    // let result = baseline(this.data.x, this.data.re, this.data.im);
  }

  applyAutoPeakPicking(options) {
    this.peaks = Object.assign({}, this.peaks);
    this.peaks.values = this.peaks.values.slice();
    const peaks = autoPeakPicking(this, options);
    this.peaks.values = peaks;
    return this.peaks;
  }

  detectRanges(options) {
    this.ranges = Object.assign({}, this.ranges);
    this.ranges.values = this.ranges.values.slice();

    const ranges = autoRangesDetection(this, options);
    this.ranges.values = ranges.map((range) => {
      range.absolute = range.integral;
      return {
        id: generateID(),
        ...range,
        kind: 'signal',
        integral: 0,
      };
    });
    return this.ranges;
  }

  deletePeak(peak) {
    this.peaks = Object.assign({}, this.peaks);
    this.peaks.values = this.peaks.values.slice();

    if (peak == null) {
      this.peaks.values = [];
    } else {
      this.peaks.values = this.peaks.values.filter(
        (p) => p.xIndex !== peak.xIndex,
      );
    }
  }

  deleteRange(id) {
    this.ranges = Object.assign({}, this.ranges);
    this.ranges.values = this.ranges.values.slice();
    if (id == null) {
      this.ranges.values = [];
    } else {
      this.ranges.values = this.ranges.values.filter(
        (range) => range.id !== id,
      );
    }
  }
  deleteIntegral(id) {
    this.integrals = Object.assign({}, this.integrals);
    this.integrals.values = this.integrals.values.slice();

    if (id == null) {
      this.integrals.values = [];
    } else {
      this.integrals.values = this.integrals.values.filter(
        (integral) => integral.id !== id,
      );
    }
  }

  setIntegral(data) {
    this.integrals = Object.assign({}, this.integrals);
    this.integrals.values = this.integrals.values.slice();
    const integralIndex = this.integrals.values.findIndex(
      (integral) => integral.id === data.id,
    );
    this.integrals.values[integralIndex] = data;
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

  // eslint-disable-next-line no-unused-vars
  addRange(from, to) {
    this.ranges = Object.assign({}, this.ranges);
    this.ranges.values = this.ranges.values.slice();

    const { fromIndex, toIndex } = X.getFromToIndex(this.data.x, { from, to });
    const data = {
      x: this.data.x.slice(fromIndex, toIndex),
      y: this.data.re.slice(fromIndex, toIndex),
    };
    try {
      const result = analyseMultiplet(data, {
        frequency: this.info.frequency,
        takeBestPartMultiplet: true,
        symmetrizeEachStep: true,
      });
      let range = {
        id: generateID(),

        from,
        to,
        absolute: this.getRangeAbsolute(from, to), // the real value,
        signal: [
          {
            delta: result.chemShift,
            multiplicity: result.j.map((j) => j.multiplicity).join(''),
            j: result.j,
            peak: [],
          },
        ],
        kind: 'signal',
        integral: this.getRangeIntegral(from, to),
      };
      this.ranges.values.push(range);
    } catch (e) {
      navigator.clipboard.writeText(JSON.stringify(data, undefined, 2));
      throw new Error('Could not calculate the multiplicity');
    }
  }

  addPeak(peak) {
    this.peaks = Object.assign({}, this.peaks);
    this.peaks.values = this.peaks.values.slice();
    if (!this.checkPeakIsExists(peak)) {
      this.peaks.values.push({
        id: generateID(),
        ...peak,
      });
    }
  }

  // Add all the peaks in a range
  // click / drag / release
  addPeaks(from, to) {
    // we look for the highest peak in the zone for now
    // but it returns an array !
    // for now you return an array containing the result of addPeak
    if (from !== to) {
      this.peaks = Object.assign({}, this.peaks);
      this.peaks.values = this.peaks.values.slice();
      const peak = this.lookupPeak(from, to);
      if (peak && !this.checkPeakIsExists(peak)) {
        this.peaks.values = this.peaks.values.concat({
          id: generateID(),
          ...peak,
        });
      }
    }
    return this.peaks;
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
