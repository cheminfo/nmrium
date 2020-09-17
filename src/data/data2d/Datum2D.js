import lodash from 'lodash';
import { zoneToX } from 'ml-spectra-processing';

import { Datum1D } from '../data1d/Datum1D';
import generateID from '../utilities/generateID';

import Processing2D from './Processing2D';
import autoZonesDetection from './autoZonesDetection';

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
        isPositiveVisible: true,
        isNegativeVisible: true,
      },
      options.display,
    );

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
    this.zones = Object.assign({ values: [], options: {} }, options.zones);

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

  getZones() {
    return lodash.cloneDeep(this.zones);
  }
  /**
   *
   * @param {object} ZoneBoundary
   * @param {number} ZoneBoundary.fromX
   * @param {number} ZoneBoundary.toX
   * @param {number} ZoneBoundary.fromY
   * @param {number} ZoneBoundary.toY
   */
  addZone(ZoneBoundary) {
    const { fromX, toX, fromY, toY } = ZoneBoundary;
    const zone = {
      x: { from: fromX, to: toX },
      y: { from: fromY, to: toY },
      signal: [
        {
          peak: [],
          x: {
            delta: (fromX + toX) / 2,
            diaID: [],
          },
          y: {
            delta: (fromY + toY) / 2,
            diaID: [],
          },
        },
      ],
    };

    this.zones.values.push({
      id: generateID(),
      ...zone,
    });
  }

  deleteZone(id) {
    if (id === undefined) {
      this.zones.values = [];
    } else {
      this.zones.values = this.zones.values.filter((zone) => zone.id !== id);
    }
  }

  setZone(data) {
    const zoneIndex = this.zones.values.findIndex(
      (zone) => zone.id === data.id,
    );
    this.zones.values[zoneIndex] = data;
  }

  /** get 2d projection
   * @param {number} x in ppm
   * @param {number} y in ppm
   */
  getSlice(position) {
    const data = this.data;
    const xStep = (data.maxX - data.minX) / (data.z[0].length - 1);
    const yStep = (data.maxY - data.minY) / (data.z.length - 1);
    const xIndex = Math.floor((position.x - data.minX) / xStep);
    const yIndex = Math.floor((position.y - data.minY) / yStep);

    if (xIndex < 0 || xIndex >= data.z[0].length) return;
    if (yIndex < 0 || yIndex >= data.z.length) return;

    let infoX = {
      nucleus: this.info.nucleus[0], // 1H, 13C, 19F, ...
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      dimension: 1,
    };

    let dataX = {
      x: zoneToX(
        { from: this.data.minX, to: this.data.maxX },
        this.data.z[0].length,
      ),
      re: new Float64Array(this.data.z[0].length),
    };

    for (let i = 0; i < this.data.z[0].length; i++) {
      dataX.re[i] += this.data.z[yIndex][i];
    }

    let infoY = {
      nucleus: this.info.nucleus[1], // 1H, 13C, 19F, ...
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      dimension: 1,
    };

    let dataY = {
      x: zoneToX(
        { from: this.data.minY, to: this.data.maxY },
        this.data.z.length,
      ),
      re: new Float64Array(this.data.z.length),
    };

    let index = this.data.z.length - 1;
    for (let i = 0; i < this.data.z.length; i++) {
      dataY.re[i] += this.data.z[index--][xIndex];
    }

    const horizontal = new Datum1D({ info: infoX, data: dataX });
    const vertical = new Datum1D({ info: infoY, data: dataY });
    return { horizontal, vertical };
  }

  /** calculate the missing projection
   * @param {string[]} nucleus
   */
  getMissingProjection(nucleus) {
    let index = this.info.nucleus.indexOf(nucleus);
    // temporary because nuclus was undefined;
    if (index === -1) index = 0;

    let info = {
      nucleus: this.info.nucleus[index], // 1H, 13C, 19F, ...
      isFid: false,
      isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      dimension: 1,
    };

    let from = index === 0 ? this.data.minX : this.data.minY;
    let to = index === 0 ? this.data.maxX : this.data.maxY;
    let nbPoints = index === 0 ? this.data.z.length : this.data.z[0].length;

    let projection = new Float64Array(nbPoints);
    if (index === 1) {
      for (let i = 0; i < this.data.z.length; i++) {
        for (let j = 0; j < this.data.z[0].length; j++) {
          projection[i] += this.data.z[i][j];
        }
      }
    } else {
      for (let i = 0; i < this.data.z[0].length; i++) {
        for (let j = 0; j < this.data.z.length; j++) {
          projection[i] += this.data.z[j][i];
        }
      }
    }

    let data = {
      x: zoneToX({ from, to }, nbPoints),
      re: projection,
    };
    const datum1D = new Datum1D({ info, data });
    return datum1D;
  }

  detectZones(options) {
    let dataMatrix = {};
    if (options.selectedZone) {
      dataMatrix = this.getSubMatrix(options.selectedZone);
    } else {
      dataMatrix = this.data;
    }
    options.info = this.info;
    const zones = autoZonesDetection(dataMatrix, options);
    let formatedZones = zones.map((zone) => {
      return {
        id: generateID(),
        x: { from: zone.fromTo[0].from, to: zone.fromTo[0].to },
        y: { from: zone.fromTo[1].from, to: zone.fromTo[1].to },
        signal: [
          {
            peak: zone.peaks,
            x: {
              delta: (zone.fromTo[0].from + zone.fromTo[0].to) / 2,
              diaID: [],
            },
            y: {
              delta: (zone.fromTo[1].from + zone.fromTo[1].to) / 2,
              diaID: [],
            },
            kind: 'signal',
          },
        ],
        // kind: zone.kind || 'signal',
      };
    });
    this.zones.values = this.zones.values.concat(formatedZones);
    return this.getZones();
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

  getSubMatrix(selectedZone) {
    const { fromX, toX, fromY, toY } = selectedZone;
    const data = this.data;
    const xStep = (data.maxX - data.minX) / data.z[0].length;
    const yStep = (data.maxY - data.minY) / data.z.length;
    let xIndexFrom = Math.floor((fromX - data.minX) / xStep);
    let yIndexFrom = Math.floor((fromY - data.minY) / yStep);
    let xIndexTo = Math.floor((toX - data.minX) / xStep);
    let yIndexTo = Math.floor((toY - data.minY) / yStep);
    let dataMatrix = { z: [], maxX: toX, minX: fromX, maxY: toY, minY: fromY };
    let maxZ = Number.MIN_SAFE_INTEGER;
    let minZ = Number.MAX_SAFE_INTEGER;

    let nbXPoints = xIndexFrom - xIndexTo + 1;
    for (let j = yIndexFrom; j < yIndexTo; j++) {
      let row = new Float32Array(nbXPoints);
      let xIndex = xIndexFrom;
      for (let i = 0; i < nbXPoints; i++) {
        row[i] = data.z[j][xIndex--];
      }
      for (let i = 0; i < row.length; i++) {
        if (maxZ < row[i]) maxZ = row[i];
        if (minZ > row[i]) minZ = row[i];
      }
      dataMatrix.z.push(Array.from(row));
    }
    dataMatrix.minZ = minZ;
    dataMatrix.maxZ = maxZ;

    return dataMatrix;
  }
}
