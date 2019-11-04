// import baseline from './baseline';
// import autoPeakPicking from './autoPeakPicking';
import max from 'ml-array-max';
import { object } from 'prop-types';

import { Filters } from './filter1d/Filters';

export class Datum1D {
  /**
   *
   * @param {string} id
   * @param {object} options {display: {name, color, isVisible, isPeaksMarksVisible, ...}, meta: {isFid, nucleus}, ... }
   */
  // TODO id can become optional
  // by default Math.random().toString(36).replace('0.','')

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
    this.signals = Object.assign([], options.signals);
    this.filters = Object.assign([], options.filters);

    //reapply filters after load the original data
    this.reapplyFilters();
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

  setIntegrals(integrals) {
    this.integrals = Object.assign([], integrals);
  }

  getIntegrals() {
    return this.integrals;
  }

  baseline(option = {}) {
    // let result = baseline(this.data.x, this.data.re, this.data.im);
  }

  applyAutoPeakPicking(option = {}) {
    // let result = autoPeakPicking(this.data.x, this.data.re);
  }

  applyShiftXFilter(shiftValue) {
    Filters.shiftX(this, shiftValue);
  }

  applyZeroFillingFilter(options) {
    const zeroFillingFilterOption = {
      kind: Filters.zeroFilling.name,
      value: options.zeroFillingSize,
    };
    const lineBroadeningFilterOption = {
      kind: Filters.lineBroadening.name,
      value: options.lineBroadeningValue,
    };
    this.addFilter(zeroFillingFilterOption);
    this.addFilter(lineBroadeningFilterOption);

    Filters.zeroFilling(this, options.zeroFillingSize);
    Filters.lineBroadening(this, options.lineBroadeningValue);
  }
  applyFFTFilter() {
    Filters.fft(this);
  }

  applyManualPhaseCorrectionFilter(filterOptions) {
    Filters.phaseCorrection(this, filterOptions);
  }

  reapplyFilters() {
    for (let i = 0; i < this.filters.length; i++) {
      this.enableFilter(this.filters[i].id, this.filters[i].flag);
    }
  }

  // id filter id
  enableFilter(id, checked) {
    this.filters = Object.assign([], this.filters);
    const index = this.filters.findIndex((filter) => filter.id === id);
    this.filters[index] = Object.assign(
      { ...this.filters[index] },
      { flag: checked },
    );
    const enabledFilters = this.filters.filter(
      (filter) => filter.flag === true,
    );
    this.data = Object.assign({ ...this.data }, { ...this.source.original });
    this.info = Object.assign({ ...this.info }, { ...this.originalInfo });

    for (let filter of enabledFilters) {
      if (filter.flag) {
        Filters[filter.kind](this, filter.value);
      }
    }
  }
  deleteFilter(id) {
    this.filters = Object.assign([], this.filters);
    this.filters = this.filters.filter((filter) => filter.id !== id);
    this.data = Object.assign({ ...this.data }, { ...this.source.original });
    this.info = Object.assign({ ...this.info }, { ...this.originalInfo });

    for (let filter of this.filters) {
      if (filter.flag) {
        Filters[filter.kind](this, filter.value);
      }
    }
  }

  getReal() {
    return { x: this.data.x, y: this.data.re };
  }

  getImaginary() {
    return { x: this.data.x, y: this.data.im };
  }

  addIntegral(from, to) {}

  // with mouse move
  lookupPeak(from, to, options = {}) {
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
    return [];
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
    this.peaks = Object.assign([], this.peaks);
    this.peaks.push(peak);
  }

  // Add all the peaks in a range
  // click / drag / release
  addPeaks(from, to, options = {}) {
    // we look for the highest peak in the zone for now
    // but it returns an array !
    // for now you return an array containing the result of addPeak
    if (from !== to) {
      this.peaks = Object.assign([], this.peaks);
      const peaks = this.lookupPeak(from, to);
      this.peaks = this.peaks.concat([peaks]);
    }
    return this.peaks;
  }

  autoPeakPicking() {}

  addFilter(filter) {
    const id = Math.random()
      .toString(36)
      .replace('0.', '');

    this.filters = Object.assign([], this.filters);
    this.filters.push({
      ...filter,
      id: id,
      flag: true,
    });
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
      signals: this.signals,
      filters: this.filters,
    };
  }
}
