import { NmrData2DFt } from 'cheminfo-types';
import { Conrec } from 'ml-conrec';
import { xMaxAbsoluteValue } from 'ml-spectra-processing';
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
const DEFAULT_CONTOURS_OPTIONS: ContourOptions = {
  positive: {
    contourLevels: [15, 100],
    numberOfLayers: 10,
  },
  negative: {
    contourLevels: [15, 100],
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

  const max = Math.max(
    Math.abs(quadrantData.minZ),
    Math.abs(quadrantData.maxZ),
  );
  const value = 3 * xMaxAbsoluteValue([positive, negative]);
  const minLevel = calculateValueOfLevel(value, max, true);

  const defaultLevel: ContourOptions = {
    negative: {
      numberOfLayers: 10,
      contourLevels: [minLevel, 100],
    },
    positive: {
      numberOfLayers: 10,
      contourLevels: [minLevel, 100],
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

function getRange(min: number, max: number, length: number, exp?: number) {
  if (exp !== undefined) {
    const factors = new Float64Array(length + 1);

    for (let i = 1; i < length + 1; i++) {
      factors[i] = factors[i - 1] + (exp - 1) / exp ** i;
    }
    const scaleFactor = factors[length - 1];
    const result = new Float64Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = (max - min) * (1 - factors[i] / scaleFactor) + min;
    }
    return Array.from(result);
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

function drawContours(
  level: ContourItem,
  spectrum: Spectrum2D,
  contourCache: Record<string, any>,
  negative = false,
  quadrant = 'rr',
) {
  const { contourLevels, numberOfLayers } = level;
  const key = negative ? 'negative' : 'positive';

  const nbLevels = Math.min(
    numberOfLayers,
    contourLevels[1] - contourLevels[0],
  );

  const { id, data } = spectrum;
  if (!contourCache[id]) {
    contourCache[id] = {};
  }

  if (!(key in contourCache[id])) {
    contourCache[id][key] = { contours: [], timeout: false };
  }

  const oneSenseContours = contourCache[id][key].contours;
  const selectedLevels = getRange(
    Math.max(0, contourLevels[0]),
    contourLevels[1],
    nbLevels,
  ).map((e) => Math.round(e));

  const levels = selectedLevels.filter((level) => !oneSenseContours[level]);
  const { contours, timeout } = getContours({
    levels,
    negative,
    data: data[quadrant],
  });

  for (const [i, level] of contours.entries()) {
    oneSenseContours[levels[i]] = level;
  }
  contourCache[id][key] = { contours: oneSenseContours, timeout };

  return {
    contours: selectedLevels.map((level) => oneSenseContours[level]),
    timeout,
  };
}

interface ContoursCalcOptions {
  levels: number[];
  negative?: boolean;
  timeout?: number;
  data: NmrData2DFt['rr'];
}

function getContours(options: ContoursCalcOptions) {
  const { levels, negative = false, timeout = 2000, data } = options;
  const xs = getRange(data.minX, data.maxX, data.z[0].length);
  const ys = getRange(data.minY, data.maxY, data.z.length);
  const conrec = new Conrec(data.z, { xs, ys, swapAxes: false });
  const max = Math.max(Math.abs(data.minZ), Math.abs(data.maxZ));

  let _range = levels.map((level) => calculateValueOfLevel(level, max));
  if (negative) {
    _range = _range.map((value) => -value);
  }

  if (_range.every((r) => r === 0)) {
    const emptyLine: number[] = [];
    return {
      contours: _range.map((r) => ({ zValue: r, lines: emptyLine })),
      timeout: false,
    };
  }

  return conrec.drawContour({
    contourDrawer: 'basic',
    levels: Array.from(_range),
    timeout,
  });
}

/**
 * calculate the intensity value in the Z matrix based in the max value of Z matrix
 * and the contour level (0-100).
 * max * (2 ** (level / 10) - 1)) / (2 ** 10 - 1)
 * @param level - integer of the contour level
 * @param max - max value of the Z matrix
 * @param invert - if it is true it calculates the contour level.
 */
function calculateValueOfLevel(level: number, max: number, invert = false) {
  if (invert) {
    return Math.ceil(10 * Math.log2(1 + (level * (2 ** 10 - 1)) / max));
  }

  return (max * (2 ** (level / 10) - 1)) / (2 ** 10 - 1);
}

export {
  drawContours,
  contoursManager,
  getDefaultContoursLevel,
  DEFAULT_CONTOURS_OPTIONS,
};
export type { ContoursLevels, ReturnContoursManager, Level, LevelSign };
