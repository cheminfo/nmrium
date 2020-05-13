import generateID from '../utilities/generateID';

import Processing2D from './Processing2D';

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
    this.integrals = Object.assign(
      { values: [], options: {} },
      options.integrals,
    );
    // this.integrals = Object.assign(
    //   { values: [], options: {} },
    //   options.integrals,
    // );
    this.processingController = new Processing2D(this.data);
    // this.data.contours = this.processingController.drawContours();
  }

  getProcessingController() {
    return this.processingController;
  }

  getContourLines() {
    return this.processingController.drawContours();
  }

  setDisplay(displayOptions) {
    this.display = Object.assign({}, this.display);
    this.display = { ...this.display, ...displayOptions };
  }

  getIntegrals() {
    return (this.integrals = Object.assign({}, this.integrals));
  }

  addIntegral(inetgral) {
    this.integrals.values.push({
      id: generateID(),
      ...inetgral,
    });
  }
  deleteIntegral(id) {
    this.integrals.values = this.integrals.values.filter((i) => i.id !== id);
  }
  /** get 2d projection
   * @param {number} x in ppm
   * @param {number} y in ppm
   */
  // eslint-disable-next-line no-unused-vars
  getProjection(x, y) {
    // return [{x,y},{x,y}]; or {top:{x,y}left:{x,y}}
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
