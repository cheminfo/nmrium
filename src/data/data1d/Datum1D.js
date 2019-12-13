// import baseline from './baseline';
import max from 'ml-array-max';

import autoPeakPicking from './autoPeakPicking';
import autoRangesDetection from './autoRangesDetection';
import { FiltersManager } from './FiltersManager';
import { Filters } from './filter1d/Filters';

export class Datum1D {
  /**
   *
   * @param {string} id
   * @param {object} options {display: {name, color, isVisible, isPeaksMarksVisible, ...}, meta: {isFid, nucleus}, ... }
   */
  constructor(options = {}) {
    this.id =
      options.id ||
      Math.random()
        .toString(36)
        .replace('0.', '');
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
          options.display.name ||
          Math.random()
            .toString(36)
            .replace('0.', ''),
        color: 'black',
        isVisible: true,
        isPeaksMarkersVisible: true,
        isRealSpectrumVisible: true,
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
    this.peaks = Object.assign([], options.peaks); // array of object {index: xIndex, xShift}
    // in case the peak does not exactly correspond to the point value
    // we can think about a second attributed `xShift`
    this.integrals = Object.assign([], options.integrals); // array of object (from: xIndex, to: xIndex)
    this.filters = Object.assign([], options.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }
    this.ranges = Object.assign([], options.ranges);

    this.preprocessing();

    //reapply filters after load the original data
    FiltersManager.reapplyFilters(this);
  }

  preprocessing() {
    if (this.info.isFid) {
      this.applyFilter([{ name: Filters.digitalFilter.id, options: {} }]);
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

  getRanges() {
    return this.ranges;
  }

  setIntegrals(integrals) {
    this.integrals = Object.assign([], integrals);
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
    const peaks = autoPeakPicking(this, options);
    this.peaks = peaks;
    return this.peaks;
  }

  detectRanges(options) {
    const ranges = autoRangesDetection(this, options);
    this.ranges = ranges.map((range) => {
      return {
        id: Math.random()
          .toString(36)
          .replace('0.', ''),
        ...range,
        _highlight: false,
      };
    });
    return this.ranges;
  }

  deletePeak(peak) {
    if (peak == null) {
      this.peaks = [];
    } else {
      this.peaks = this.peaks.filter((p) => p.xIndex !== peak.xIndex);
    }
  }

  deleteRange(id) {
    if (id == null) {
      this.ranges = [];
    } else {
      this.ranges = this.ranges.filter((range) => range.id !== id);
    }
  }

  highlightRange(id, _highlight) {
    const ranges = this.ranges.map((range) => {
      return range.id === id
        ? {
            ...range,
            _highlight: _highlight,
          }
        : range;
    });
    this.ranges = ranges;
  }

  deleteIntegral(id) {
    if (id == null) {
      this.integrals = [];
    } else {
      this.integrals = this.integrals.filter((integral) => integral.id !== id);
    }
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
    return { x: this.data.x, y: this.data.re };
  }

  getImaginary() {
    return { x: this.data.x, y: this.data.im };
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
      const xValue = this.data.x[minIndex + xIndex + 1];

      return { x: xValue, y: yValue, xIndex: minIndex + xIndex + 1 };
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

  addPeak(peak) {
    this.peaks = this.peaks.slice(0);
    this.peaks.push({
      id: Math.random()
        .toString(36)
        .replace('0.', ''),
      ...peak,
    });
  }

  // Add all the peaks in a range
  // click / drag / release
  addPeaks(from, to) {
    // we look for the highest peak in the zone for now
    // but it returns an array !
    // for now you return an array containing the result of addPeak
    if (from !== to) {
      this.peaks = this.peaks.slice(0);
      const peak = this.lookupPeak(from, to);
      if (peak) {
        this.peaks = this.peaks.concat({
          id: Math.random()
            .toString(36)
            .replace('0.', ''),
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

  toJSON() {
    return {
      data: this.data,
      id: this.id,
      source: {
        jcamp: this.source.jcamp,
        jcampURL: this.source.jcampURL,
        original: this.source.jcampURL ? [] : this.source.original,
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
