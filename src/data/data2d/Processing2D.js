import { Conrec } from 'ml-conrec';

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
  constructor(
    minMax,
    options = defaultContourOptions,
    defaultLevel = {
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

    this.median = minMax.noise;

    this.minMax = minMax;
  }

  getLevel() {
    return {
      levelPositive: this.currentLevelPositive,
      levelNegative: this.currentLevelNegative,
    };
  }

  setLevel(levelPositive, levelNegative) {
    this.currentLevelPositive = levelPositive;
    this.currentLevelNegative = levelNegative;
  }

  setOptions(options) {
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

  wheel(value) {
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

  shiftWheel(value) {
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

  drawContours() {
    const zoomPositive = this.currentLevelPositive / 2 + 1;
    const zoomNegative = this.currentLevelNegative / 2 + 1;
    const {
      positive: { numberOfLayers: numberOfPositiveLayer },
      negative: { numberOfLayers: numberOfNegativeLayer },
    } = this.options;
    return {
      positive: this.getContours(zoomPositive, {
        nbLevels: numberOfPositiveLayer,
      }),
      negative: this.getContours(zoomNegative, {
        negative: true,
        nbLevels: numberOfNegativeLayer,
      }),
    };
  }

  getContours(zoomLevel, options = {}) {
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
    let contours = [];
    try {
      contours = this.conrec.drawContour({
        contourDrawer: 'basic', // shape or basic
        levels: _range,
        timeout: timeout,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      throw e;
    }

    return contours;
  }
}

function getRange(min, max, length, exp) {
  if (exp) {
    let factors = [];

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

function range(from, to, step) {
  const result = [];

  for (let i = from; i < to; i += step) {
    result.push(i);
  }

  return result;
}
