import { Spectrum1D } from 'nmr-load-save';
import {
  Info1D,
  NMRRange,
  NMRSignal1D,
  rangesToXY,
  signalsToXY,
} from 'nmr-processing';

import { UsedColors } from '../../../../types/UsedColors';
import { initiateDatum1D } from '../initiateDatum1D';

interface ResurrectSpectrumOptions {
  info: Partial<Info1D>;
  usedColors: UsedColors;
  from?: number;
  to?: number;
  spectrumID?: string;
}

function resurrectSpectrumFromRanges(
  ranges: NMRRange[],
  options: ResurrectSpectrumOptions,
): Spectrum1D | undefined {
  const { spectrumID, usedColors, from, to, info } = options;
  const {
    nucleus,
    solvent,
    name = null,
    baseFrequency = 400,
    originFrequency = 400,
    numberOfPoints = 2 ** 17,
  } = info;

  try {
    const { x, y } = rangesToXY(ranges, {
      nucleus,
      frequency: baseFrequency,
      nbPoints: numberOfPoints,
      from,
      to,
    });
    const datum = initiateDatum1D(
      {
        id: spectrumID,
        data: { x, im: null, re: y },
        info: {
          numberOfPoints,
          nucleus,
          originFrequency,
          baseFrequency,
          pulseSequence: '',
          solvent,
          isFt: true,
          name,
        },
        ranges: { values: ranges, options: { sum: 100 } },
      },
      { usedColors },
    );

    return datum;
  } catch (error) {
    reportError(error);
  }
}

function resurrectSpectrumFromSignals(
  signals: NMRSignal1D[],
  options: ResurrectSpectrumOptions,
): Spectrum1D | undefined {
  const { spectrumID, usedColors, from, to, info } = options;
  const {
    nucleus,
    solvent,
    name = null,
    baseFrequency = 400,
    originFrequency = 400,
    numberOfPoints: nbPoints = 2 ** 17,
  } = info;

  try {
    const { x, y } = signalsToXY(signals, {
      frequency: baseFrequency,
      nbPoints,
      from,
      to,
    });
    const datum = initiateDatum1D(
      {
        id: spectrumID,
        data: { x, im: null, re: y },
        info: {
          nucleus,
          originFrequency,
          baseFrequency,
          pulseSequence: '',
          solvent,
          isFt: true,
          name,
        },
        ranges: { values: signals, options: { sum: 100 } },
      },
      { usedColors },
    );

    return datum;
  } catch (error) {
    reportError(error);
  }
}

export { resurrectSpectrumFromRanges, resurrectSpectrumFromSignals };
