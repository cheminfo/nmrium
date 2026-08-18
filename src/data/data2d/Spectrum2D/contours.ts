import type { Spectrum2D, Spectrum } from '@zakodium/nmrium-core';
import { isSpectrum2DFt } from '@zakodium/nmrium-core';
import type { DataXY, NmrData2DFt } from 'cheminfo-types';
import { Conrec } from 'ml-conrec';
import { matrixMaxAbsoluteZ, matrixMinMaxZ, matrixToArray } from 'ml-spectra-processing';
import type { Spectrum } from 'nmr-correlation';

import type { SpectrumFTData } from '../../../component/hooks/use2DReducer.tsx';
import { calculateSanPlot } from '../../utilities/calculateSanPlot.js';

import { computeMinContourLevel } from './autoContourLevel.ts';
import { NMRContourCalculator } from './countourLevelFinder.ts';
import { findAutomaticContourLevels } from './findBestMinContour.ts';
import { getContourThresholdFromPercentiles } from './getContourThresholdFromPercentiles.ts';

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

interface BaseWheelOptions {
  altKey: boolean;
  invertScroll?: boolean;
}

interface WheelOptions extends BaseWheelOptions {
  contourOptions: ContourOptions;
}

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

interface ContoursManagerReturn {
  wheel: (value: number, options: BaseWheelOptions) => Level;
  getLevel: () => Level;
  checkLevel: () => Level;
}

function getDefaultContoursLevel(spectrum: Spectrum2D, quadrant = 'rr') {
  const { data, info, filters } = spectrum;

  // @ts-expect-error type of NmrData2D should have a discriminator field to separate fid and ft
  const quadrantData = data[quadrant];

  const { acquisitionScheme } = info;
  //@ts-expect-error will be included in nexts versions
  const {
    experiment = '',
    noise = calculateSanPlot('2D', quadrantData, {
      magnitudeMode: acquisitionScheme === 'notPhaseSensitive',
    }),
  } = info;

  const { percentiles, sanplot } = noise;

  const max = matrixMaxAbsoluteZ(quadrantData.z) // Math.max(positiveSanPlotMax, negativeSanPlotMax);//

  const isSymmetrized = filters.some(
    (filter) => filter.name === 'symmetrizeCosyLike' && filter.enabled,
  );
  const isNUS = filters.some(
    (filter) => filter.name === 'nusDimension2' && filter.enabled,
  );

  const { positive: pPositive, negative: pNegative } = percentiles;

  const percentileValue = isSymmetrized ? (isNUS ? 60 : 70) : 99;
  const pPositiveValue = pPositive[percentileValue];
  const pNegativeValue = pNegative[percentileValue];

  const optimalContourLevel = getContourThresholdFromPercentiles(
    pPositive,
    pNegative,
    {
      minP: 80,
      maxP: 99,
      madScale: 1,
    },
  );
  // console.log(matrixToArray(quadrantData.z).length, matrixMinMaxZ(quadrantData.z), matrixMaxAbsoluteZ(quadrantData.z), max, sanplot, 'length of data') 
  // const contourLevelProposal = computeMinContourLevel(
  //   matrixToArray(quadrantData.z),
  //   Math.max(noise.positive, noise.negative),
  //   {
  //     signalPurityTarget: 0.998,
  //     searchMaxMultiple: 1000,
  //   }
  // );

  const newProposarGemma = NMRContourCalculator.calculateInitialMinLevel(matrixToArray(quadrantData.z), quadrantData.z.length,
    quadrantData.z[0].length, { contourRatio: 1.5, noiseSigma: Math.max(noise.positive, noise.negative), targetSignalLevels: 10, signalPercentile: 0.999 });
  const bestMinLevel = findAutomaticContourLevels(
    matrixToArray(quadrantData.z),
    quadrantData.z.length,
    quadrantData.z[0].length,
    Math.max(noise.poistive, noise.negative),
    {
      persistenceLevels: 10,
      ridgeCoverageThreshold: experiment.includes('jres') ? 0.8 : 0.1
    }
  );
  console.log(newProposarGemma, 'newProposarGemma');
  console.log(contourLevelProposal, 'contourLevelProposal');
  console.log(bestMinLevel, 'bestMinLevel');
  // const minAllowedByPercentile = Math.max(
  //   pPositiveValue ?? 0,
  //   pNegativeValue ?? 0,
  // );

  // const minLevel =
  //   isSymmetrized || isNUS
  //     ? Math.min(optimalContourLevel, minAllowedByPercentile)
  //     : Math.max(optimalContourLevel, minAllowedByPercentile);
  const minContourLevel = Math.min(
    calculateValueOfLevel(bestMinLevel.minLevelWithoutT1Noise, max, true),
    DEFAULT_CONTOURS_OPTIONS.positive.contourLevels[1] -
      DEFAULT_CONTOURS_OPTIONS.positive.numberOfLayers,
  );
  console.log(`minLevel`, minContourLevel, calculateValueOfLevel(contourLevelProposal.minLevel, max, true), calculateValueOfLevel(bestMinLevel.minLevelWithoutT1Noise, max, true));
  const defaultLevel: ContourOptions = {
    negative: {
      numberOfLayers: DEFAULT_CONTOURS_OPTIONS.negative.numberOfLayers,
      contourLevels: [
        minContourLevel,
        DEFAULT_CONTOURS_OPTIONS.negative.contourLevels[1],
      ],
    },
    positive: {
      numberOfLayers: DEFAULT_CONTOURS_OPTIONS.positive.numberOfLayers,
      contourLevels: [
        minContourLevel,
        DEFAULT_CONTOURS_OPTIONS.positive.contourLevels[1],
      ],
    },
  };
  return defaultLevel;
}



function contoursManager(options: ContourOptions): ContoursManagerReturn {
  const contourOptions = { ...options };
  return {
    wheel: (value, options) =>
      prepareWheel(value, { ...options, contourOptions }),
    getLevel: () => contourOptions,
    checkLevel: () => prepareCheckLevel(contourOptions),
  };
}

function prepareWheel(value: number, options: WheelOptions) {
  const { altKey, contourOptions, invertScroll = false } = options;

  const sign = Math.sign(value);
  const direction = invertScroll ? -sign : sign;

  // This function is doing the bad practice of mutating its parameters.
  /* eslint-disable unicorn/consistent-destructuring */
  const { positive, negative } = contourOptions;
  const {
    contourLevels: [minPositiveLevel, maxPositiveLevel],
  } = positive;
  const {
    contourLevels: [minNegativeLevel, maxNegativeLevel],
  } = negative;

  if (altKey) {
    if (
      (minPositiveLevel === 0 && direction === -1) ||
      (minPositiveLevel >= maxPositiveLevel - positive.numberOfLayers &&
        direction === 1)
    ) {
      return contourOptions;
    }
    contourOptions.positive.contourLevels[0] += direction * 2;
  } else {
    if (
      (minPositiveLevel > 0 && direction === -1) ||
      (minPositiveLevel <= maxPositiveLevel - positive.numberOfLayers &&
        direction === 1)
    ) {
      contourOptions.positive.contourLevels[0] += direction * 2;
    }

    if (
      (minNegativeLevel > 0 && direction === -1) ||
      (minNegativeLevel <= maxNegativeLevel - negative.numberOfLayers &&
        direction === 1)
    ) {
      contourOptions.negative.contourLevels[0] += direction * 2;
    }
  }
  /* eslint-enable unicorn/consistent-destructuring */

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
  if (exp !== undefined && length > 0) {
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
  spectrum: SpectrumFTData,
  negative = false,
) {
  const { contourLevels, numberOfLayers } = level;

  return getContours({
    negative,
    boundary: contourLevels,
    nbLevels: numberOfLayers,
    data: spectrum.data,
  });
}

interface ContoursCalcOptions {
  boundary: [number, number];
  negative?: boolean;
  timeout?: number;
  nbLevels: number;
  data: NmrData2DFt['rr'];
}

function getContours(options: ContoursCalcOptions) {
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

  const minLevel = calculateValueOfLevel(boundary[0], max);
  const maxLevel = calculateValueOfLevel(boundary[1], max);
  const diffRange = boundary[1] - boundary[0];

  let _range = getRange(minLevel, maxLevel, Math.min(nbLevels, diffRange), 2);
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

export function initializeContoursLevels(spectrum: Spectrum2D) {
  const { data } = spectrum;

  if ('rr' in data) return getDefaultContoursLevel(spectrum);

  return DEFAULT_CONTOURS_OPTIONS;
}

export function initializeContours(spectra: Spectrum[]) {
  const contoursOptions: Record<string, ContourOptions> = {};
  for (const spectrum of spectra) {
    if (isSpectrum2DFt(spectrum)) {
      const spectrum2D = spectrum as Spectrum2D;
      contoursOptions[spectrum2D.id] = initializeContoursLevels(spectrum2D);
    }
  }
  return contoursOptions;
}

export { contoursManager, drawContours };
export type { LevelSign };
