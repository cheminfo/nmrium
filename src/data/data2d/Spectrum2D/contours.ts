import { Conrec } from 'ml-conrec';

import { Datum2D } from '../../types/data2d';
import { MinMaxContent } from '../../types/data2d/Data2D';
import { calculateSanPlot } from '../../utilities/calculateSanPlot';

interface Level {
  positive: number;
  negative: number;
}

interface ContourItem {
  contourLevels: [number, number];
  numberOfLayers: number;
}
interface ContourOptions {
  positive: ContourItem;
  negative: ContourItem;
}
interface WheelOptions {
  shiftKey: boolean;
  contourOptions: ContourOptions;
  currentLevel: Level;
}

interface ContoursLevels {
  [key: string]: Level;
}
const DEFAULT_CONTOURS_OPTIONS = {
  positive: {
    contourLevels: [0, 21],
    numberOfLayers: 10,
  },
  negative: {
    contourLevels: [0, 21],
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

function getDefaultContoursLevel(options: ContourOptions) {
  const defaultLevel: Level = { negative: 10, positive: 10 };
  for (const sign of LEVEL_SIGNS) {
    const [min, max] = options[sign].contourLevels;
    defaultLevel[sign] = min + max / 2;
  }
  return defaultLevel;
}

function contoursManager(
  spectrumID: string,
  state: ContoursLevels,
  options: ContourOptions,
): ReturnContoursManager {
  const spectraLevels = { ...state };
  const contourOptions = { ...options };

  if (!state?.[spectrumID]) {
    const defaultLevel = getDefaultContoursLevel(contourOptions);
    spectraLevels[spectrumID] = defaultLevel;
  }

  const currentLevel = spectraLevels[spectrumID];

  const wheel = (value, shiftKey) =>
    prepareWheel(value, { shiftKey, contourOptions, currentLevel });
  const getLevel = () => currentLevel;
  const checkLevel = () => prepareCheckLevel(currentLevel, contourOptions);
  return { wheel, getLevel, checkLevel };
}

function prepareWheel(value: number, options: WheelOptions) {
  let { shiftKey, currentLevel, contourOptions } = options;
  const sign = Math.sign(value);
  const positiveBoundary = contourOptions.positive.contourLevels;
  const negativeBoundary = contourOptions.negative.contourLevels;

  if (shiftKey) {
    if (
      (currentLevel.positive === positiveBoundary[0] && sign === -1) ||
      (currentLevel.positive >= positiveBoundary[1] && sign === 1)
    ) {
      return currentLevel;
    }
    currentLevel.positive += sign;
  } else {
    if (
      (currentLevel.positive > positiveBoundary[0] && sign === -1) ||
      (currentLevel.positive < positiveBoundary[1] && sign === 1)
    ) {
      currentLevel.positive += sign;
    }

    if (
      (currentLevel.negative > negativeBoundary[0] && sign === -1) ||
      (currentLevel.negative < negativeBoundary[1] && sign === 1)
    ) {
      currentLevel.negative += sign;
    }
  }
  return currentLevel;
}

function prepareCheckLevel(currentLevel: Level, options: ContourOptions) {
  const level = { ...currentLevel };
  for (const sign of LEVEL_SIGNS) {
    const [min, max] = options[sign].contourLevels;
    //check if the level is out of the boundary
    if (level[sign] > max) {
      level[sign] = max;
    } else if (level[sign] < min) {
      level[sign] = min;
    }
  }
  return level;
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

function drawContours(
  level: number,
  datum: Datum2D,
  negative = false,
): { contours: any; timeout: boolean } {
  const zoom = level / 2 + 1;
  const {
    positive: { numberOfLayers: numberOfPositiveLayer },
    negative: { numberOfLayers: numberOfNegativeLayer },
  } = datum.display.contourOptions;

  if (negative) {
    return getContours(zoom, {
      negative,
      nbLevels: numberOfNegativeLayer,
      data: datum.data.rr,
    });
  }

  return getContours(zoom, {
    nbLevels: numberOfPositiveLayer,
    data: datum.data.rr,
  });
}

interface ContoursCalcOptions {
  negative?: boolean;
  timeout?: number;
  nbLevels: number;
  data: MinMaxContent;
}

function getContours(zoomLevel, options: ContoursCalcOptions) {
  const { negative = false, timeout = 2000, nbLevels, data } = options;

  const xs = getRange(data.minX, data.maxX, data.z[0].length);

  const ys = getRange(data.minY, data.maxY, data.z.length);

  const conrec = new Conrec(data.z, { xs, ys, swapAxes: false });

  const sanResult = calculateSanPlot('2D', data);
  const median = sanResult.positive;

  const max = Math.max(Math.abs(data.maxZ), Math.abs(data.minZ));

  let _range = getRange(median * 1 * Math.pow(2, zoomLevel), max, nbLevels, 2);

  if (negative) {
    _range = _range.map((value) => -value);
  }

  return conrec.drawContour({
    contourDrawer: 'basic', // shape or basic
    levels: _range,
    timeout,
  });
}

export {
  drawContours,
  contoursManager,
  getDefaultContoursLevel,
  DEFAULT_CONTOURS_OPTIONS,
};
export type { ContoursLevels, ReturnContoursManager, Level, LevelSign };
