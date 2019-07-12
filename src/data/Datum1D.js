import baseline from './baseline';
import { convert } from 'jcampconverter';

export class Datum1D {
  constructor(x, re, im, options = {}) {
    this.original = {};
    this.x = x;
    this.re = re;
    this.im = im;
    this.peaks = []; // array of object {index: xIndex}
    this.integrals = []; // array of object (from: xIndex, to: xIndex)
    this.signals = [];
    this.filters = [
      {
        kind: 'shiftX',
        value: -5,
      },
    ];
  }

  baseline(options) {
    let result = baseline(this.x, this.re, this.im);
  }

  getReal() {
    return { x: this.x, y: this.re };
  }

  getImaginary() {
    return { x: this.x, y: this.im };
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
    return new Datum1D(x, re, im);
  };
}
