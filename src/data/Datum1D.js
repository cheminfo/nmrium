import baseline from './baseline';
import applyFilter from './filter1d/filter';

import { convert } from 'jcampconverter';
import { tsParenthesizedType } from '@babel/types';
import { SHIFT_X } from './filter1d/filter1d-type';

export class Datum1D {
  static myInstance = null;

  constructor(x, re, im, options = {}) {
    this.original = { x, re, im };
    this.x = x;
    this.re = re;
    this.im = im;

    this.peaks = []; // array of object {index: xIndex}
    this.integrals = []; // array of object (from: xIndex, to: xIndex)
    this.signals = [];
    this.filters = []; // [{kind: 'shiftX',value: -5,},{.....}]
  }

  baseline(options) {
    let result = baseline(this.x, this.re, this.im);
  }

  applyShiftXFiliter(shiftValue) {
    let data = { x: this.x, y: this.re };

    this.x = applyFilter({ kind: SHIFT_X, value: shiftValue }, data).x;
  }

  undoFilter(pastChainFiliters = []) {
    let data = { x: this.original.x, y: this.original.re };
    
    if (pastChainFiliters.length !== 0) {
      pastChainFiliters.map((filiter) => {
        data = applyFilter({ kind: filiter.kind, value: filiter.value }, data);
      });
    }

    this.x = data.x;
    this.re = data.y;

    return data;
  }

  redoFilter(nextFiliter) {
    let data = { x: this.x, y: this.re };
    data = applyFilter(
      { kind: nextFiliter.kind, value: nextFiliter.value },
      data,
    );
    this.x = data.x;
    this.re = data.y;
    return data;
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

  getPeaks() {
    return this.peaks;
  }

  addFilter(filter) {
    this.filters.push(filter);
  }

  static fromJcamp = function fromJcamp(text) {
    let result = convert(text, { xy: true });

    let x =
      result.spectra[0] &&
      result.spectra[0].data &&
      result.spectra[0].data[0] &&
      result.spectra[0].data[0].y
        ? result.spectra[0].data[0].x
        : [];
    let re =
      result.spectra[0] &&
      result.spectra[0].data &&
      result.spectra[0].data[0] &&
      result.spectra[0].data[0].y
        ? result.spectra[0].data[0].y
        : [];
    let im =
      result.spectra[1] &&
      result.spectra[1].data &&
      result.spectra[1].data[0] &&
      result.spectra[1].data[0].y
        ? result.spectra[1].data[0].y
        : [];

    if (Datum1D.myInstance == null) {
      this.myInstance = new Datum1D(x, re, im);
    } else {
      Datum1D.myInstance.x = x;
      Datum1D.myInstance.re = re;
      Datum1D.myInstance.im = im;
    }

    return this.myInstance;
  };

  static InitiateInstance(x, re, im) {
    if (Datum1D.myInstance == null) {
      this.myInstance = new Datum1D(x, re, im);
    } else {
      Datum1D.myInstance.x = x;
      Datum1D.myInstance.re = re;
      Datum1D.myInstance.im = im;
    }

    return this.myInstance;
  }

  static getInstance() {
    // if (Datum1D.myInstance == null) {
    //   Datum1D.myInstance = new Datum1D();
    // }

    return this.myInstance;
  }
}
