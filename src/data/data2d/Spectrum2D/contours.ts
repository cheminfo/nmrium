import { NmrData2DFt } from 'cheminfo-types';
import { Conrec } from 'ml-conrec';
import { BasicContour } from 'ml-conrec/lib/BasicContourDrawer';
import { xFindClosestIndex, xMaxAbsoluteValue } from 'ml-spectra-processing';
import { Spectrum2D } from 'nmr-load-save';

import { calculateSanPlot } from '../../utilities/calculateSanPlot';

interface Level {
  positive: ContourItem;
  negative: ContourItem;
}

type ContourLevels = [number, number];
interface ContourItem {
  contourLevels: ContourLevels;
  numberOfLayers: number;
}
interface ContourOptions {
  positive: ContourItem;
  negative: ContourItem;
}
interface WheelOptions {
  altKey: boolean;
  contourOptions: ContourOptions;
}

type ContoursLevels = Record<string, Level>;

const MAX_LEVELS = 100;
const DEFAULT_CONTOURS_OPTIONS: ContourOptions = {
  positive: {
    contourLevels: [15, MAX_LEVELS],
    numberOfLayers: 10,
  },
  negative: {
    contourLevels: [15, MAX_LEVELS],
    numberOfLayers: 10,
  },
};
type LevelSign = keyof Level;

const LEVEL_SIGNS: Readonly<[LevelSign, LevelSign]> = ['positive', 'negative'];
interface ReturnContoursManager {
  wheel: (value: number, shift: boolean) => Level;
  getLevel: () => Level;
  checkLevel: () => Level;
}

function getDefaultContoursLevel(spectrum: Spectrum2D, quadrant = 'rr') {
  const { data, info } = spectrum;

  const quadrantData = data[quadrant];

  //@ts-expect-error will be included in nexts versions
  const { noise = calculateSanPlot('2D', quadrantData) } = info;

  const { positive, negative } = noise;

  const value = 3 * xMaxAbsoluteValue([positive, negative]);

  const allLevelValues = getLevelValues(
    new Array(101).fill(0).map((_, index) => index),
    quadrantData,
  );
  const minLevel = xFindClosestIndex(allLevelValues, value);

  console.log({ minLevel, value });

  const defaultLevel: ContourOptions = {
    negative: {
      numberOfLayers: 10,
      contourLevels: [minLevel, MAX_LEVELS],
    },
    positive: {
      numberOfLayers: 10,
      contourLevels: [minLevel, MAX_LEVELS],
    },
  };
  return defaultLevel;
}

function contoursManager(spectrum: Spectrum2D): ReturnContoursManager {
  const contourOptions = { ...spectrum.display.contourOptions };

  const wheel = (value, altKey) =>
    prepareWheel(value, { altKey, contourOptions });
  const getLevel = () => contourOptions;
  const checkLevel = () => prepareCheckLevel(contourOptions);
  return { wheel, getLevel, checkLevel };
}

function prepareWheel(value: number, options: WheelOptions) {
  const { altKey, contourOptions } = options;

  const sign = Math.sign(value);

  const { positive, negative } = contourOptions;
  const {
    contourLevels: [minPositiveLevel, maxPositiveLevel],
  } = positive;
  const {
    contourLevels: [minNegativeLevel, maxNegativeLevel],
  } = negative;

  if (altKey) {
    if (
      (minPositiveLevel === 0 && sign === -1) ||
      (minPositiveLevel >= maxPositiveLevel - positive.numberOfLayers &&
        sign === 1)
    ) {
      return contourOptions;
    }
    contourOptions.positive.contourLevels[0] += sign * 2;
  } else {
    if (
      (minPositiveLevel > 0 && sign === -1) ||
      (minPositiveLevel <= maxPositiveLevel - positive.numberOfLayers &&
        sign === 1)
    ) {
      contourOptions.positive.contourLevels[0] += sign * 2;
    }

    if (
      (minNegativeLevel > 0 && sign === -1) ||
      (minNegativeLevel <= maxNegativeLevel - negative.numberOfLayers &&
        sign === 1)
    ) {
      contourOptions.negative.contourLevels[0] += sign * 2;
    }
  }
  return contourOptions;
}

function prepareCheckLevel(options: ContourOptions) {
  for (const sign of LEVEL_SIGNS) {
    const {
      numberOfLayers,
      contourLevels: [min, max],
    } = options[sign];

    //check if the level is out of the boundary
    if (min >= max - numberOfLayers) {
      const newMin = Math.min(100 - numberOfLayers, Math.max(0, min));
      options[sign].contourLevels = [newMin, newMin + numberOfLayers];
    } else if (min < 0) {
      options[sign].contourLevels[0] = 0;
    }
  }

  return options;
}

function getRange(min: number, max: number, length: number) {
  const step = (max - min) / (length - 1);
  return range(min, max + step / 2, step);
}

function range(from: number, to: number, step: number) {
  const result: number[] = [];

  for (let i = from; i < to; i += step) {
    result.push(i);
  }

  return result;
}

interface DrawContoursOptions {
  negative?: boolean;
  quadrant?: 'rr' | 'ri' | 'ir' | 'ii';
  cache: Map<number, BasicContour>;
}

function drawContours(
  spectrum: Spectrum2D,
  level: ContourItem,
  options: DrawContoursOptions,
) {
  const { negative = false, quadrant = 'rr', cache } = options;
  const { contourLevels, numberOfLayers } = level;

  return getContours({
    negative,
    boundary: contourLevels,
    nbLevels: numberOfLayers,
    data: spectrum.data[quadrant],
    cache,
  });
}

interface ContoursCalcOptions {
  boundary: [number, number];
  negative?: boolean;
  timeout?: number;
  nbLevels: number;
  data: NmrData2DFt['rr'];
  cache: Map<number, BasicContour>;
}

/**
 * We calculate the current levels (0->100) to be considered
 * @param min
 * @param max
 * @param nbLevels
 * @returns
 */
function getLevels(min, max, nbLevels) {
  const levels: number[] = [];
  if (max - min + 1 < nbLevels) {
    for (let i = min; i <= max; i++) {
      levels.push(i);
    }
  } else {
    const step = (max - min) / (nbLevels - 1);
    for (let i = 0; i < nbLevels; i++) {
      levels.push(Math.round(min + i * step));
    }
  }
  return levels;
}

function getLevelValues(levels: number[], data, options = {}) {
  const { negative = false, exponent = true } = options;
  const max = Math.max(Math.abs(data.minZ), Math.abs(data.maxZ));
  const min = 0;
  const levelValues: number[] = [];

  if (exponent) {
    const factors = new Float64Array(MAX_LEVELS + 1);
    factors[0] = 1;

    for (let i = 1; i <= MAX_LEVELS; i++) {
      factors[i] = factors[i - 1] * 1.1;
    }
    const scaleFactor = factors[MAX_LEVELS];
    for (const level of levels) {
      levelValues.push(
        (max - min) * ((factors[level] - factors[0]) / scaleFactor) + min,
      );
    }
  } else {
    const step = (max - min) / MAX_LEVELS;
    for (const level of levels) {
      levelValues.push(min + step * level);
    }
  }
  if (negative) {
    return levelValues.map((value) => -value);
  }
  return levelValues;
}

function getContours(options: ContoursCalcOptions) {
  const {
    boundary,
    negative = false,
    timeout = 2000,
    nbLevels,
    data,
    cache,
  } = options;

  const levels = getLevels(boundary[0], boundary[1], nbLevels);
  const levelValues = getLevelValues(levels, data, {
    negative,
  });

  //  if (isZeroLevelValues(levelValues)) {
  //   return createEmptyResult(levelValues);
  // }

  const contours: BasicContour[] = [];
  const levelValuesToCalculate: number[] = [];
  const levelsToCalculate: number[] = [];
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (cache.has(level)) {
      contours.push(cache.get(level) as BasicContour);
    } else {
      levelValuesToCalculate.push(levelValues[i]);
      levelsToCalculate.push(level);
    }
  }

  const conrec = initializeConrec(data);
  console.time('contour');
  const { timeout: hasTimeout, contours: conrecContours } = conrec.drawContour({
    contourDrawer: 'basic',
    levels: levelValuesToCalculate,
    timeout,
  });
  console.timeEnd('contour');

  /*
  const nbContoursLines = conrecContours.reduce(
    (acc, contour) => acc + contour.lines.length,
    0,
  );
  console.log('nbContoursLines', nbContoursLines);
  */

  for (const conrecContour of conrecContours) {
    const index = levelValuesToCalculate.indexOf(conrecContour.zValue);
    cache.set(levelsToCalculate[index], conrecContour);
  }
  contours.push(...conrecContours);

  return {
    contours,
    timeout: hasTimeout,
  };
}

/**
 * calculate the intensity value in the Z matrix based in the max value of Z matrix
 * and the contour level (0-100).
 * max * (2 ** (level / 10) - 1)) / (2 ** 10 - 1)
 * @param level - integer of the contour level
 * @param max - max value of the Z matrix
 */
function calculateValueOfLevel(level: number, max: number) {
  return Math.ceil(10 * Math.log2(1 + (level * (2 ** 10 - 1)) / max));
}

function isZeroLevelValues(levels: number[]): boolean {
  return levels.every((level) => level === 0);
}

function createEmptyResult(levelValues: number[]) {
  return {
    contours: levelValues.map((levelValue) => ({
      zValue: levelValue,
      lines: [],
    })),
    timeout: false,
  };
}

function initializeConrec(data: ContoursCalcOptions['data']): Conrec {
  const xs = getRange(data.minX, data.maxX, data.z[0].length);
  const ys = getRange(data.minY, data.maxY, data.z.length);
  return new Conrec(data.z, { xs, ys, swapAxes: false });
}

export {
  drawContours,
  contoursManager,
  getDefaultContoursLevel,
  DEFAULT_CONTOURS_OPTIONS,
};
export type { ContoursLevels, ReturnContoursManager, Level, LevelSign };
