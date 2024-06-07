import { NmrData2DFt } from 'cheminfo-types';
import { Conrec } from 'ml-conrec';
import { Spectrum2D } from 'nmr-load-save';

interface Level {
  positive: ContourLevels;
  negative: ContourLevels;
}

type ContourLevels = [number, number];
interface ContourItem {
  contourLevels: ContourLevels;
  numberOfLayers: number;
  numberOfZoomLevels: number;
}
interface ContourOptions {
  noise: { positive: number; negative: number };
  positive: ContourItem;
  negative: ContourItem;
}
interface WheelOptions {
  altKey: boolean;
  contourOptions: ContourOptions;
  currentLevel: Level;
}

type ContoursLevels = Record<string, Level>;
const DEFAULT_CONTOURS_OPTIONS: Pick<ContourOptions, 'positive' | 'negative'> =
  {
    positive: {
      contourLevels: [15, 100],
      numberOfLayers: 10,
      numberOfZoomLevels: 35,
    },
    negative: {
      contourLevels: [15, 100],
      numberOfLayers: 10,
      numberOfZoomLevels: 35,
    },
  };
type LevelSign = keyof Level;

const LEVEL_SIGNS: Readonly<[LevelSign, LevelSign]> = ['positive', 'negative'];
interface ReturnContoursManager {
  wheel: (value: number, shift: boolean) => Level;
  getLevel: () => Level;
  checkLevel: () => Level;
}

function getDefaultContoursLevel(
  spectrum: Spectrum2D,
  noise: number,
  quadrant = 'rr',
) {
  const { positive, negative } = DEFAULT_CONTOURS_OPTIONS;
  const defaultLevel: Level = {
    negative: [0, 100],
    positive: [0, 100],
  };
  console.log(defaultLevel);
  const data = spectrum.data[quadrant];
  const max = Math.max(Math.abs(data.minZ), Math.abs(data.maxZ));
  for (const sign of LEVEL_SIGNS) {
    //@ts-expect-error to check why of this error
    defaultLevel[sign][0] = (100 * Math.log(max / noise)) / Math.log(1.25) / 35;
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

  // if (!state?.[spectrumID]) {
  //   const defaultLevel = getDefaultContoursLevel(contourOptions);
  //   spectraLevels[spectrumID] = defaultLevel;
  // }

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
    contourOptions.positive.contourLevels[0] += sign * 2;
  } else {
    if (
      (minPositiveLevel > 0 && sign === -1) ||
      (minPositiveLevel < maxPositiveLevel - positive.numberOfLayers &&
        sign === 1)
    ) {
      contourOptions.positive.contourLevels[0] += sign * 2;
    }

    if (
      (minNegativeLevel > 0 && sign === -1) ||
      (minNegativeLevel < maxNegativeLevel - negative.numberOfLayers &&
        sign === 1)
    ) {
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
    if (min > max - numberOfLayers) {
      options[sign].contourLevels[0] = max - numberOfLayers;
    } else if (min < 0) {
      options[sign].contourLevels[0] = 0;
    }
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
  noise: number,
  spectrum: Spectrum2D,
  negative = false,
  quadrant = 'rr',
) {
  const {
    positive: {
      contourLevels: positiveBoundary,
      numberOfLayers: numberOfPositiveLayer,
    },
    negative: {
      contourLevels: negativeBoundary,
      numberOfLayers: numberOfNegativeLayer,
    },
  } = spectrum.display.contourOptions;

  if (negative) {
    const contours = getContours({
      noise,
      negative,
      boundary: negativeBoundary,
      nbLevels: numberOfNegativeLayer,
      data: spectrum.data[quadrant],
    });
    return contours;
  }
  const contours = getContours({
    noise,
    boundary: positiveBoundary,
    nbLevels: numberOfPositiveLayer,
    data: spectrum.data[quadrant],
  });
  return contours;
}

interface ContoursCalcOptions {
  noise: number;
  zoomLevels?: number; //@TODO it would be required at the end.
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
  const factor = 35 / 100;

  if (!negative) {
    console.log(boundary);

    // console.log({
    //   level,
    //   zoomLevel,
    //   boundary,
    //   numberOfZoomLevels,
    // });
  }
  const xs = getRange(data.minX, data.maxX, data.z[0].length);
  const ys = getRange(data.minY, data.maxY, data.z.length);

  const conrec = new Conrec(data.z, { xs, ys, swapAxes: false });

  const max = Math.max(Math.abs(data.minZ), Math.abs(data.maxZ));
  const minLevel = max / 1.25 ** ((100 - boundary[0]) * factor);
  const maxLevel = max / 1.25 ** (Math.max(0, 100 - boundary[1]) * factor);

  let _range = getRange(minLevel, maxLevel, nbLevels, 2);

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
