// import baseline from './baseline';
// import autoPeakPicking from './autoPeakPicking';
import max from 'ml-array-max';

import applyFilter from './filter1d/filter';
import { SHIFT_X } from './filter1d/filter1d-type';

export class Datum1D {
  /**
   *
   * @param {string} id
   * @param {object} options {display: {name, color, isVisible, isPeaksMarksVisible, ...}, meta: {isFid, nucleus}, ... }
   */
  // TODO id can become optional
  // by default Math.random().toString(36).replace('0.','')

  constructor(options = {}) {
    /* TODO
    What are the different categories of information about a Datum1D ?
    * display: {color, isVisible, ...} // all that is related to display information
    * data: {re:[], im:[], y:[], meta: {}}
    * dataSource ????
    * info: {isFid, isComplex, nucleus, solvent, frequency, temperature, ...}
    * ranges: [],
    * signals: [],
    * annotations: [],
    *
*/
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

    console.log(options.data);
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

    // [{kind: 'shiftX',value: -5,},{.....}]
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
    console.log(integrals);
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
    let data = { x: this.data.x, y: this.data.re };
    this.data.x = applyFilter({ kind: SHIFT_X, value: shiftValue }, data).x;
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
    this.filters = Object.assign([], this.filters);
    this.filters.push(filter);
    console.log(filter);
    console.log(this.filters);
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
      info: this.info,
      peaks: this.peaks,
      integrals: this.integrals,
      signals: this.signals,
      filters: this.filters,
    };
  }
}
