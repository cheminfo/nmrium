import cloneDeep from 'lodash/cloneDeep';
import { Conrec } from 'ml-conrec';

export const defaultContourOptions = {
  positive: {
    contourLevels: [20, 100],
    numberOfLayers: 10,
  },
  negative: {
    contourLevels: [20, 100],
    numberOfLayers: 10,
  },
};

const maxLevelsNumber = 101;

export default class Processing2D {
  constructor(
    minMax,
    options = defaultContourOptions,
    defaultLevel = {
      positive: 10,
      negative: 10,
    },
  ) {
    this.options = cloneDeep(options);
    const { positive, negative } = defaultLevel;

    this.currentLevelPositive = positive;
    this.currentLevelNegative = negative;

    const xs = getRange(minMax.minX, minMax.maxX, minMax.z[0].length);

    const ys = getRange(minMax.minY, minMax.maxY, minMax.z.length);

    this.conrec = new Conrec(minMax.z, { xs, ys, swapAxes: false });

    this.median = minMax.noise;

    this.minMax = minMax;

    const max = Math.max(
      Math.abs(this.minMax.maxZ),
      Math.abs(this.minMax.minZ),
    );

    this.allowedLevels = getRange(this.median, max, maxLevelsNumber, 1.15).map(
      (level) => ({
        cache: { positive: {}, negative: {} },
        zValue: level,
      }),
    );
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
    options = cloneDeep(options);
    this.currentLevelPositive = options.positive.contourLevels[0];
    this.currentLevelNegative = options.negative.contourLevels[0];

    this.options = options;
  }

  getOptions() {
    return this.options;
  }

  wheel(value) {
    const sign = Math.sign(value);
    if (
      (this.currentLevelPositive > 0 && sign === -1) ||
      (this.currentLevelPositive < maxLevelsNumber && sign === 1)
    ) {
      this.options.positive.contourLevels[0] += sign;
      this.currentLevelPositive += sign;
    }

    if (
      (this.currentLevelNegative > 0 && sign === -1) ||
      (this.currentLevelNegative < maxLevelsNumber && sign === 1)
    ) {
      this.options.negative.contourLevels[0] += sign;
      this.currentLevelNegative += sign;
    }
  }

  shiftWheel(value) {
    const sign = Math.sign(value);

    if (
      (this.currentLevelNegative > 0 && sign === -1) ||
      (this.currentLevelNegative < maxLevelsNumber && sign === 1)
    ) {
      this.options.negative.contourLevels[0] += sign;
      this.currentLevelNegative += sign;
    }
  }

  drawContours() {
    // const zoomPositive = this.currentLevelPositive / 2 + 1;
    // const zoomNegative = this.currentLevelNegative / 2 + 1;
    // const {
    //   positive: { numberOfLayers: numberOfPositiveLayer },
    //   negative: { numberOfLayers: numberOfNegativeLayer },
    // } = this.options;
    return {
      positive: this.getContours(),
      negative: this.getContours({ negative: true }),
    };
  }

  getLevels(negative = false) {
    const levelKey = negative ? 'negative' : 'positive';
    let levels = [];
    const [min, max] = this.options[levelKey].contourLevels;
    const numberOfLayers = this.options[levelKey].numberOfLayers;
    if (numberOfLayers < 1) return [];
    let interval = numberOfLayers < 2 ? 1 : (max - min) / (numberOfLayers - 1);
    interval = interval < 1 ? 1 : interval;
    let currentLevel = min;
    let previousIndex = Number.NEGATIVE_INFINITY;
    while (currentLevel < max + interval / 2) {
      let currentIndex = Math.round(currentLevel);
      if (currentIndex !== previousIndex) {
        previousIndex = currentIndex;
        levels.push(this.allowedLevels[currentIndex]);
      }
      currentLevel += interval;
    }
    return negative ? levels.reverse() : levels;
  }

  getContours(options = {}) {
    const { negative = false, timeout = 5000, maxLines = 1e6 } = options;
    const levelKey = negative ? 'negative' : 'positive';
    try {
      const levels = this.getLevels(negative);
      const toCalculate = [];
      for (const level of levels) {
        if (!level.cache[levelKey].lines) {
          toCalculate.push(level);
        }
      }

      const newContours = this.conrec.drawContour({
        contourDrawer: 'basic', // shape or basic
        levels: toCalculate.map((level) => level.zValue * (negative ? -1 : 1)),
        timeout,
      });
      for (let i = 0; i < toCalculate.length; i++) {
        if (newContours[i].lines.length < maxLines) {
          toCalculate[i].cache[levelKey].lines = newContours[i].lines;
        } else {
          toCalculate[i].cache[levelKey].lines = [];
          toCalculate[i].cache[levelKey].degraded = true;
        }
      }
      for (let level of levels) {
        console.log(level.cache[levelKey].lines.length);
      }
      return levels.map((level) => ({
        lines: level.cache[levelKey].lines,
        zValue: level.zValue,
      }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      throw e;
    }
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
      result[length - i - 1] =
        (max - min) * (1 - factors[i + 1] / lastFactor) + min;
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
