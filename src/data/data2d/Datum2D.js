import { Conrec } from 'ml-conrec';

import generateID from '../utilities/generateID';

export class Datum2D {
  /**
   *
   * @param {string} id
   * @param {object} options {display: {name, isVisible, ...}, meta: {isFid, nucleus}, ... }
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
        name: options.display.name || generateID(),
        positiveColor: 'red',
        negativeColor: 'blue',
        isVisible: true,
      },
      options.display,
    );
    // this.original = options.data; //{ x, re, im }
    this.info = Object.assign(
      {
        nucleus: ['1H', '1H'],
        isFid: false,
        isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      },
      options.info,
    );

    this.originalInfo = Object.assign(
      {
        nucleus: ['1H', '1H'], // 1H, 13C, 19F, ...
        isFid: false,
        isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      },
      options.info,
    );
    this.meta = Object.assign({}, options.meta);
    this.data = Object.assign(
      {
        z: [],
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
      },
      options.data,
    );
    console.log(this.data);
  }

  getContourLines() {
    const conrec = new Conrec(this.data.z);
    const basic = conrec.drawContour({
      contourDrawer: 'basic',
      nbLevels: 10,
      timeout: 10000,
    });
    return basic;
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
    };
  }
}
