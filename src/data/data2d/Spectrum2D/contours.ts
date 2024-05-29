import { NmrData2DFt } from 'cheminfo-types';
import { Conrec } from 'ml-conrec';
import { Spectrum2D } from 'nmr-load-save';

interface Level {
  positive: number;
  negative: number;
}

interface ContourItem {
  contourLevels: [number, number];
  numberOfLayers: number;
  // numberOfZoomLevels: number;
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
const DEFAULT_CONTOURS_OPTIONS = {
  positive: {
    contourLevels: [0, 31],
    numberOfLayers: 10,
    // numberOfZoomLevels: 31,
  },
  negative: {
    contourLevels: [0, 31],
    numberOfLayers: 10,
    // numberOfZoomLevels: 31,
  },
};
type LevelSign = keyof Level;
type ZoomLevel = Record<'positive' | 'negative', { min; max; level }>;
const MAX_CONTOURS_LEVEL = 100;
const MIN_CONTOURS_LEVEL = 0;

const LEVEL_SIGNS: Readonly<[LevelSign, LevelSign]> = ['positive', 'negative'];
interface ReturnContoursManager {
  wheel: (value: number, shift: boolean) => ZoomLevel;
  getLevel: () => Level;
  checkLevel: () => Level;
}

function getDefaultContoursLevel(options: ContourOptions) {
  const defaultLevel: ZoomLevel = {
    negative: { level: 0, min: 0, max: 31 },
    positive: { level: 0, min: 0, max: 31 },
  };
  for (const sign of LEVEL_SIGNS) {
    const [min, max] = options[sign].contourLevels;
    const level = Math.round((max - min) * 0.7 + min);
    defaultLevel[sign].level = level;
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
    const {
      positive: { level: pLevel },
      negative: { level: nLevel },
    } = getDefaultContoursLevel(contourOptions);
    spectraLevels[spectrumID] = { positive: pLevel, negative: nLevel };
  }

  const currentLevel = spectraLevels[spectrumID];
  const wheel = (value, altKey) =>
    prepareWheel(value, { altKey, contourOptions, currentLevel });
  const getLevel = () => currentLevel;
  const checkLevel = () => prepareCheckLevel(currentLevel, contourOptions);
  return { wheel, getLevel, checkLevel };
}

function prepareWheel(value: number, options: WheelOptions): ZoomLevel {
  const { altKey, currentLevel, contourOptions } = options;
  const {
    positive: {
      contourLevels: [pMin, pMax],
    },
    negative: {
      contourLevels: [nMin, nMax],
    },
  } = contourOptions;
  const { positive: pLevel, negative: nLevel } = currentLevel;
  const positiveNumberOfZoomLevels = pMax - pMin;
  const negativeNumberZoomLevels = nMax - nMin;

  // const numberOfZoomLevels =
  const sign = Math.sign(value);
  const data: ZoomLevel = {
    positive: {
      level: pLevel,
      min: pMin,
      max: pMax,
    },
    negative: {
      level: nLevel,
      min: nMin,
      max: nMax,
    },
  };
  if (altKey) {
    if (
      (pLevel === MIN_CONTOURS_LEVEL && sign === 1) ||
      (pLevel >= MAX_CONTOURS_LEVEL && sign === -1)
    ) {
      return data;
    }
  } else {
    if (
      (pLevel > MIN_CONTOURS_LEVEL && sign === 1) ||
      (pLevel < MAX_CONTOURS_LEVEL && sign === -1)
    ) {
      const level = pLevel - sign;
      let min = checkMinValue(level, sign, pMin, pMax);
      let max = checkMaxValue(level, sign, pMin, pMax);
      const diff = max - min;
      if (diff < positiveNumberOfZoomLevels) {
        if (min === 0) {
          max = positiveNumberOfZoomLevels;
        }

        if (max === 100) {
          min = max - positiveNumberOfZoomLevels;
        }
      }

      data.positive = { level, min, max };
    }

    if (
      (nLevel > MIN_CONTOURS_LEVEL && sign === 1) ||
      (nLevel < MAX_CONTOURS_LEVEL && sign === -1)
    ) {
      const level = nLevel - sign;
      let min = checkMinValue(level, sign, nMin, nMax);
      let max = checkMaxValue(level, sign, nMin, nMax);

      const diff = max - min;
      if (diff < negativeNumberZoomLevels) {
        if (min === 0) {
          max = negativeNumberZoomLevels;
        }

        if (max === 100) {
          min = max - negativeNumberZoomLevels;
        }
      }

      data.negative = { level, min, max };
    }
  }
  return data;
}

function checkMaxValue(level, sign, min, max) {
  if (level >= MAX_CONTOURS_LEVEL) {
    return MAX_CONTOURS_LEVEL;
  }

  if (level >= min && level <= max) {
    return max;
  }
  const newMax = max - sign * (max - min);

  if (newMax >= MAX_CONTOURS_LEVEL) {
    return MAX_CONTOURS_LEVEL;
  }
  return newMax;
}
function checkMinValue(level, sign, min, max) {
  if (level < MIN_CONTOURS_LEVEL) {
    return MIN_CONTOURS_LEVEL;
  }

  if (level >= min && level <= max) {
    return min;
  }
  const newMin = min - sign * (max - min);

  if (newMin < MIN_CONTOURS_LEVEL) {
    return MIN_CONTOURS_LEVEL;
  }

  return newMin;
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
  level: number,
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
    const contours = getContours(level, {
      noise,
      negative,
      boundary: negativeBoundary,
      nbLevels: numberOfNegativeLayer,
      data: spectrum.data[quadrant],
    });
    return contours;
  }
  const contours = getContours(level, {
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

function getContours(
  zoomLevel: number,
  options: ContoursCalcOptions,
): {
  contours: Float64Array;
  timeout: boolean;
} {
  const {
    boundary,
    negative = false,
    timeout = 2000,
    nbLevels,
    data,
    noise,
  } = options;
  const numberOfZoomLevels = boundary[1] - boundary[0];
  const xs = getRange(data.minX, data.maxX, data.z[0].length);
  const ys = getRange(data.minY, data.maxY, data.z.length);

  const conrec = new Conrec(data.z, { xs, ys, swapAxes: false });

  const dataMax = Math.max(Math.abs(data.minZ), Math.abs(data.maxZ));

  const max = (dataMax / 100) * boundary[1];
  const min = Math.max(noise, (dataMax / 100) * boundary[0]);

  const minLevel = (max - min) / 1.25 ** zoomLevel + min;
  const maxLevel = Math.min(
    max,
    (max - min) / 1.25 ** Math.max(0, zoomLevel - numberOfZoomLevels) + min,
  );

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
