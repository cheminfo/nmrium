import { Conrec } from 'ml-conrec';

import { Data2D } from '../types/data2d';
import { calculateSanPlot } from '../utilities/calculateSanPlot';

export const defaultContourOptions = {
  positive: {
    contourLevels: [0, 21],
    numberOfLayers: 10,
  },
  negative: {
    contourLevels: [0, 21],
    numberOfLayers: 10,
  },
};

export default class Processing2D {
  private options: any;
  private currentLevelPositive: number;
  private currentLevelNegative: number;
  private conrec: Conrec;
  private median: number;
  private minMax: any;

  public constructor(
    minMax: any,
    options: any = defaultContourOptions,
    defaultLevel: any = {
      positive: 10,
      negative: 10,
    },
  ) {
    this.options = options;

    const { positive, negative } = defaultLevel;

    this.currentLevelPositive = positive;
    this.currentLevelNegative = negative;

    const xs = getRange(minMax.minX, minMax.maxX, minMax.z[0].length);

    const ys = getRange(minMax.minY, minMax.maxY, minMax.z.length);

    this.conrec = new Conrec(minMax.z, { xs, ys, swapAxes: false });

    const sanResult = calculateSanPlot('2D', minMax as Data2D);
    this.median = sanResult.positive;

    this.minMax = minMax;
  }

  public getLevel() {
    return {
      levelPositive: this.currentLevelPositive,
      levelNegative: this.currentLevelNegative,
    };
  }

  public setLevel(levelPositive, levelNegative) {
    this.currentLevelPositive = levelPositive;
    this.currentLevelNegative = levelNegative;
  }

  public setOptions(options) {
    const positiveBoundary = options.positive.contourLevels;
    const negativeBoundary = options.negative.contourLevels;

    if (this.currentLevelPositive >= positiveBoundary[1]) {
      this.currentLevelPositive = positiveBoundary[1];
    } else if (this.currentLevelPositive <= positiveBoundary[0]) {
      this.currentLevelPositive = positiveBoundary[0];
    }

    if (this.currentLevelNegative >= negativeBoundary[1]) {
      this.currentLevelNegative = negativeBoundary[1];
    } else if (this.currentLevelNegative <= negativeBoundary[0]) {
      this.currentLevelNegative = negativeBoundary[0];
    }

    this.options = options;
  }

  public wheel(value) {
    const sign = Math.sign(value);
    const positiveBoundary = this.options.positive.contourLevels;
    const negativeBoundary = this.options.negative.contourLevels;

    if (
      (this.currentLevelPositive > positiveBoundary[0] && sign === -1) ||
      (this.currentLevelPositive < positiveBoundary[1] && sign === 1)
    ) {
      this.currentLevelPositive += sign;
    }

    if (
      (this.currentLevelNegative > negativeBoundary[0] && sign === -1) ||
      (this.currentLevelNegative < negativeBoundary[1] && sign === 1)
    ) {
      this.currentLevelNegative += sign;
    }
  }

  public shiftWheel(value) {
    const sign = Math.sign(value);
    const [min, max] = this.options.positive.contourLevels;
    if (
      (this.currentLevelPositive === min && sign === -1) ||
      (this.currentLevelPositive >= max && sign === 1)
    ) {
      return;
    }

    this.currentLevelPositive += sign;
    return [];
  }

  public drawContours() {
    const zoomPositive = this.currentLevelPositive / 2 + 1;
    const zoomNegative = this.currentLevelNegative / 2 + 1;
    const {
      positive: { numberOfLayers: numberOfPositiveLayer },
      negative: { numberOfLayers: numberOfNegativeLayer },
    } = this.options;

    let contours: any = {};
    let error: any = null;

    try {
      contours = {
        positive: this.getContours(zoomPositive, {
          nbLevels: numberOfPositiveLayer,
        }),
        negative: this.getContours(zoomNegative, {
          negative: true,
          nbLevels: numberOfNegativeLayer,
        }),
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      error = e;
    }
    return { contours, error };
  }

  public getContours(zoomLevel, options: any = {}) {
    const { negative = false, timeout = 2000, nbLevels = 10 } = options;

    const max = Math.max(
      Math.abs(this.minMax.maxZ),
      Math.abs(this.minMax.minZ),
    );

    let _range = getRange(
      this.median * 1 * Math.pow(2, zoomLevel),
      max,
      nbLevels,
      2,
    );

    if (negative) {
      _range = _range.map((value) => -value);
    }

    const contours = this.conrec.drawContour({
      contourDrawer: 'basic', // shape or basic
      levels: _range,
      timeout,
    });

    return Object.freeze(contours);
  }
}

function getRange(min: number, max: number, length: number, exp?: number) {
  if (exp !== undefined) {
    const factors: number[] = [];

    factors[0] = 0;

    for (let i = 1; i <= length; i++) {
      factors[i] = factors[i - 1] + (exp - 1) / Math.pow(exp, i);
    }

    const lastFactor = factors[length];

    const result = new Array(length);

    for (let i = 0; i < length; i++) {
      result[i] = (max - min) * (1 - factors[i + 1] / lastFactor) + min;
    }

    return result;
  } else {
    const step = (max - min) / (length - 1);

    return range(min, max + step / 2, step);
  }
}

function range(from: number, to: number, step: number) {
  const result: number[] = [];

  for (let i = from; i < to; i += step) {
    result.push(i);
  }

  return result;
}
