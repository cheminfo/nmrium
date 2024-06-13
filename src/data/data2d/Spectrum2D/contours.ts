import { NmrData2DFt } from 'cheminfo-types';
import { Conrec } from 'ml-conrec';
import { xMaxAbsoluteValue, xNoiseSanPlot } from 'ml-spectra-processing';
import { Spectrum2D } from 'nmr-load-save';

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
  currentLevel: Level;
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
  const { noise = xNoiseSanPlot(quadrantData) } = info;

  const { positive, negative } = noise;

  const max = Math.max(
    Math.abs(quadrantData.minZ),
    Math.abs(quadrantData.maxZ),
  );

  const minLevel = Math.ceil(
    10 *
      Math.log2(
        1 + (3 * xMaxAbsoluteValue([positive, negative]) * (2 ** 10 - 1)) / max,
      ),
  );

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

function contoursManager(
  spectrum: Spectrum2D,
  state: any,
): ReturnContoursManager {
  const { id: spectrumID } = spectrum;
  const spectraLevels = { ...state };
  const contourOptions = { ...spectrum.display.contourOptions };

  if (!state?.[spectrumID]) {
    const defaultLevel = getDefaultContoursLevel(spectrum);
    spectraLevels[spectrumID] = defaultLevel;
  }

  const currentLevel = spectraLevels[spectrumID];

  const wheel = (value, altKey) =>
    prepareWheel(value, { altKey, contourOptions, currentLevel });
  const getLevel = () => currentLevel;
  const checkLevel = () => prepareCheckLevel(currentLevel, contourOptions);
  return { wheel, getLevel, checkLevel };
}

function prepareWheel(value: number, options: WheelOptions) {
  const { altKey, currentLevel, contourOptions } = options;

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
      return currentLevel;
    }
    currentLevel.positive.contourLevels[0] += sign * 2;
    contourOptions.positive.contourLevels[0] += sign * 2;
  } else {
    if (
      (minPositiveLevel > 0 && sign === -1) ||
      (minPositiveLevel <= maxPositiveLevel - positive.numberOfLayers &&
        sign === 1)
    ) {
      currentLevel.positive.contourLevels[0] += sign * 2;
      contourOptions.positive.contourLevels[0] += sign * 2;
    }

    if (
      (minNegativeLevel > 0 && sign === -1) ||
      (minNegativeLevel <= maxNegativeLevel - negative.numberOfLayers &&
        sign === 1)
    ) {
      currentLevel.negative.contourLevels[0] += sign * 2;
      contourOptions.negative.contourLevels[0] += sign * 2;
    }
  }

  return currentLevel;
}

function prepareCheckLevel(currentLevel: Level, options: ContourOptions) {
  const level = { ...currentLevel };
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

    level[sign].contourLevels = [min, max];
    level[sign].numberOfLayers = numberOfLayers;
  }
  return level;
}

function getRange(min: number, max: number, length: number, exp?: number) {
  if (exp !== undefined) {
    const factors = new Float64Array(length + 1);

    for (let i = 1; i < length + 1; i++) {
      factors[i] = factors[i - 1] + (exp - 1) / exp ** i;
    }
    const lastFactor = factors[length];
    const result = new Float64Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = (max - min) * (1 - factors[i] / lastFactor) + min;
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
  level: ContourItem,
  spectrum: Spectrum2D,
  negative = false,
  quadrant = 'rr',
) {
  const { contourLevels, numberOfLayers } = level;

  const contours = getContours({
    negative,
    boundary: contourLevels,
    nbLevels: numberOfLayers,
    data: spectrum.data[quadrant],
  });
  return contours;
}

interface ContoursCalcOptions {
  boundary: [number, number];
  negative?: boolean;
  timeout?: number;
  nbLevels: number;
  data: NmrData2DFt['rr'];
}

function getContours(options: ContoursCalcOptions): {
  contours: Float64Array;
  timeout: boolean;
} {
  const {
    boundary,
    negative = false,
    timeout = 2000,
    nbLevels,
    data,
  } = options;
  const xs = getRange(data.minX, data.maxX, data.z[0].length);
  const ys = getRange(data.minY, data.maxY, data.z.length);
  const conrec = new Conrec(data.z, { xs, ys, swapAxes: false });

  const max = Math.max(Math.abs(data.minZ), Math.abs(data.maxZ));
  const minLevel = (max * (2 ** (boundary[0] / 10) - 1)) / (2 ** 10 - 1);
  const maxLevel = (max * (2 ** (boundary[1] / 10) - 1)) / (2 ** 10 - 1);

  const diffRange = boundary[1] - boundary[0];

  let _range = getRange(minLevel, maxLevel, Math.min(nbLevels, diffRange), 2);
  if (negative) {
    _range = _range.map((value) => -value);
  }

  if (_range.every((r) => r === 0)) {
    return {
      contours: _range.map((r) => ({ zValue: r, lines: [] })),
      timeout: false,
    };
  }

  return conrec.drawContour({
    contourDrawer: 'basic',
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
