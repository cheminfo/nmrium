import baseline from './baseline';
import autoPeakPicking from './autoPeakPicking';
import applyFilter from './filter1d/filter';

import { SHIFT_X } from './filter1d/filter1d-type';

export class Datum1D {
  // static myInstance = null;

  // static dataum1Objects = [];
  /**
   *
   * @param {string} id
   * @param {object} data    {x, re, im}
   * @param {object} options {display: {name, color, isVisible, isPeaksMarksVisible, ...}, meta: {isFid, nucleus}, ... }
   */

  // TODO id can become optional
  // by default Math.random().toString(36).replace('0.','')

  constructor(data, options = {}) {
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
   console.log(options);
   
    this.id =options.id ||Math.random().toString(36).replace('0.', '');
    this.name = options.display.name;
    this.color = options.display.color;
    this.isVisible = options.display.isVisible;
    this.isPeaksMarkersVisible = options.display.isPeaksMarkersVisible;
    this.isRealSpectrumVisible = options.display.isRealSpectrumVisible || true;
    this.original = data; //{ x, re, im }
    this.nucleus = options.info.nucleus || '1H'; // 1H, 13C, 19F, ...
    this.isFid = options.info.isFid || false;
    this.isComplex = options.info.isComplex || false; // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    this.x = data.x;
    this.re = data.re;
    this.im = data.im;
    this.peaks = []; // array of object {index: xIndex, xShift}
    // in case the peak does not exactly correspond to the point value
    // we can think about a second attributed `xShift`
    this.integrals = []; // array of object (from: xIndex, to: xIndex)
    this.signals = [];
    this.filters = [];
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
    this.integrals = integrals;
  }

  getIntegrals() {
    return this.integrals;
  }

  baseline(options) {
    let result = baseline(this.x, this.re, this.im);
  }

  autoPeakPicking(options) {
    let result = autoPeakPicking(this.x, this.re);
  }

  applyShiftXFilter(shiftValue) {
    let data = { x: this.x, y: this.re };
    this.x = applyFilter({ kind: SHIFT_X, value: shiftValue }, data).x;
  }

  getReal() {
    return { x: this.x, y: this.re };
  }

  getImaginary() {
    return { x: this.x, y: this.im };
  }

  addIntegral(from, to) {}

  /**
   *
   * @param {number} chemicalShift Target chemical shift
   * @param {number} window Range of chemical shifts to look for
   * @example  addPeak(5, 0.1)
   */
  addPeak(chemicalShift, window, options = {}) {}

  autoPeakPicking() {}

  addFilter(filter) {
    this.filters.push(filter);
  }

  toJSON() {
    return {
      data: { x: this.x, re: this.re, im: this.im },
      options: {
          id: this.id,
          display: {
            name: this.name,
            color: this.color,
            isVisible: this.isVisible,
            isPeaksMarkersVisible: this.isPeaksMarkersVisible,
          },
          info: {
            nucleus: this.nucleus,
            isFid: this.isFid,
            isComplex: this.isComplex,
          }
      },
    };
  }
}
