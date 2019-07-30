import baseline from './baseline';
import autoPeakPicking from './autoPeakPicking';
import applyFilter from './filter1d/filter';

import { convert } from 'jcampconverter';
import { SHIFT_X } from './filter1d/filter1d-type';

export class Datum1D {
  // static myInstance = null;

  // static dataum1Objects = [];

  constructor(id, x, re, im, name, color, isVisible,isPeaksMarkersVisible, options = {}) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.isVisible = isVisible;
    this.isPeaksMarkersVisible= isPeaksMarkersVisible;
    this.original = { x, re, im };
    this.nucleus = options.nucleus || '1H'; // 1H, 13C, 19F, ...
    this.isFid = options.isFid || false;

    this.x = x;
    this.re = re;
    this.im = im;
    this.peaks = []; // array of object {index: xIndex, xShift}
    // in case the peak does not exactly correspond to the point value
    // we can think about a second attributed `xShift`
    this.integrals = []; // array of object (from: xIndex, to: xIndex)
    this.signals = [];
    this.filters = [];
    // [{kind: 'shiftX',value: -5,},{.....}]
  }


  setPeaks(peaks){
    this.peaks = peaks;
  }

  getPeaks(){
    return this.peaks;
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

  setPeaks(peaks) {
    this.peaks = peaks;
  }

  addIntegral(from, to) {}

  /**
   *
   * @param {number} chemicalShift Target chemical shift
   * @param {number} window Range of chemical shifts to look for
   * @example  addPeak(5, 0.1)
   */
  addPeak(chemicalShift, window, options = {}) {

      

  }

  autoPeakPicking() {}

  getPeaks() {
    return this.peaks;
  }

  addFilter(filter) {
    this.filters.push(filter);
  }

  // static fromJcamp = function fromJcamp(id, text, name, color, isVisible) {
  //   let result = convert(text, { xy: true });

  //   let x =
  //     result.spectra[0] &&
  //     result.spectra[0].data &&
  //     result.spectra[0].data[0] &&
  //     result.spectra[0].data[0].y
  //       ? result.spectra[0].data[0].x
  //       : [];
  //   let re =
  //     result.spectra[0] &&
  //     result.spectra[0].data &&
  //     result.spectra[0].data[0] &&
  //     result.spectra[0].data[0].y
  //       ? result.spectra[0].data[0].y
  //       : [];
  //   let im =
  //     result.spectra[1] &&
  //     result.spectra[1].data &&
  //     result.spectra[1].data[0] &&
  //     result.spectra[1].data[0].y
  //       ? result.spectra[1].data[0].y
  //       : [];

  //   const ob = new Datum1D(id, x, re, im, name, color, isVisible);

  //   return ob;
  // };

  // // static InitiateInstance(x, re, im) {
  // //   if (Datum1D.myInstance === null) {
  // //     Datum1D.myInstance = new Datum1D(x, re, im);
  // //   } else {
  // //     Datum1D.myInstance.setData(x, re, im)

  // //   }

  // //   return Datum1D.myInstance;
  // // }

  // static pushObject(object) {
  //   Datum1D.dataum1Objects.push(object);
  // }

  // static getObject(id) {
  //   return Datum1D.dataum1Objects.find((ob) => ob.id === id);
  // }

  // static getXYData() {
  //   return Datum1D.dataum1Objects.map((ob) => {
  //     return {
  //       id: ob.id,
  //       x: ob.x,
  //       y: ob.re,
  //       name: ob.name,
  //       color: ob.color,
  //       isVisible: ob.isVisible,
  //     };
  //   });
  // }

  // static getOriginalData() {
  //   return Datum1D.dataum1Objects.map((ob) => {
  //     return {
  //       id: ob.id,
  //       x: ob.x,
  //       y: ob.re,
  //       name: ob.name,
  //       color: ob.color,
  //       isVisible: ob.isVisible,
  //     };
  //   });
  // }

  // static undoFilter(pastChainFiliters = []) {
  //   // let data = { x: this.original.x, y: this.original.re };
  //   Datum1D.dataum1Objects.forEach((ob) => {
  //     ob.x = ob.original.x;
  //     ob.re = ob.original.re;
  //   });

  //   if (pastChainFiliters.length !== 0) {
  //     pastChainFiliters.forEach((filter) => {
  //       const ob = Datum1D.getObject(filter.id);
  //       let data = { x: ob.x, y: ob.re };
  //       data = applyFilter({ kind: filter.kind, value: filter.value }, data);
  //       Datum1D.getObject(filter.id).x = data.x;
  //       Datum1D.getObject(filter.id).re = data.y;
  //     });

  //     // this.x = data.x;
  //     // this.re = data.y;
  //   }
  // }

  // static redoFilter(nextFilter) {
  //   const ob = Datum1D.getObject(nextFilter.id);

  //   let data = { x: ob.x, y: ob.re };
  //   data = applyFilter(
  //     { kind: nextFilter.kind, value: nextFilter.value },
  //     data,
  //   );
  //   ob.x = data.x;
  //   ob.re = data.y;
  // }
}
