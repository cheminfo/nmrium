import { v4 } from '@lukeed/uuid';
import { Spectrum } from 'nmr-load-save';
import {
  Signal2D,
  Zone,
  predictAll,
  signalsToXY,
  signals2DToZ,
  getFrequency,
  PredictedAll,
  signalsToRanges,
  Prediction1D,
  Prediction2D,
} from 'nmr-processing';
import OCL from 'openchemlib/full';

import { DatumKind } from './constants/SignalsKinds';
import {
  initiateDatum1D,
  mapRanges,
  updateIntegralsRelativeValues,
} from './data1d/Spectrum1D';
import { initiateDatum2D } from './data2d/Spectrum2D';
import { adjustAlpha } from './utilities/generateColor';
import { xMinMaxValues } from 'ml-spectra-processing';
import { Logger } from 'cheminfo-types';

export type Experiment = 'proton' | 'carbon' | 'cosy' | 'hsqc' | 'hmbc';
export type SpectraPredictionOptions = Record<Experiment, boolean>;
export type PredictedSpectraResult = Partial<
  Record<Experiment, Prediction1D | Prediction2D>
>;

export interface PredictionOptions {
  name: string;
  frequency: number;
  '1d': {
    '1H': { from: number; to: number };
    '13C': { from: number; to: number };
    nbPoints: number;
    lineWidth: number;
  };
  '2d': {
    nbPoints: { x: number; y: number };
  };
  autoExtendRange: boolean;
  spectra: SpectraPredictionOptions;
  logger?: Logger;
}

export const getDefaultPredictionOptions = (): PredictionOptions => ({
  name: '',
  frequency: 400,
  '1d': {
    '1H': { from: -1, to: 12 },
    '13C': { from: -5, to: 220 },
    nbPoints: 2 ** 17,
    lineWidth: 1,
  },
  '2d': {
    nbPoints: { x: 1024, y: 1024 },
  },
  spectra: {
    proton: true,
    carbon: true,
    cosy: true,
    hsqc: true,
    hmbc: true,
  },
  autoExtendRange: true,
});

export const FREQUENCIES: Array<{ value: number; label: string }> = [
  { value: 40, label: '40 MHz' },
  { value: 60, label: '60 MHz' },
  { value: 80, label: '80 MHz' },
  { value: 90, label: '90 MHz' },
  { value: 100, label: '100 MHz' },
  { value: 200, label: '200 MHz' },
  { value: 300, label: '300 MHz' },
  { value: 400, label: '400 MHz' },
  { value: 500, label: '500 MHz' },
  { value: 600, label: '600 MHz' },
  { value: 800, label: '800 MHz' },
  { value: 1000, label: '1000 MHz' },
  { value: 1200, label: '1200 MHz' },
];

const baseURL = 'https://nmr-prediction.service.zakodium.com';

export async function predictSpectra(molfile: string): Promise<PredictedAll> {
  const molecule = OCL.Molecule.fromMolfile(molfile);

  return predictAll(molecule, {
    predictOptions: {
      C: {
        webserviceURL: `${baseURL}/v1/predict/carbon`,
      },
    },
  });
}

function generateName(
  name: string,
  options: { frequency: number | number[]; experiment: string },
) {
  const { frequency, experiment } = options;
  const freq = Array.isArray(frequency)
    ? frequency.map((f) => `${f}MHz`).join('_')
    : `${frequency}MHz`;
  return name || `${experiment.toUpperCase()}_${freq}_${v4()}`;
}

export function generateSpectra(
  predictedSpectra: PredictedSpectraResult,
  inputOptions: PredictionOptions,
  color: string,
  logger: Logger,
): Spectrum[] {
  checkFromTo(predictedSpectra, inputOptions, logger);
  const spectra: Spectrum[] = [];
  for (const experiment in predictedSpectra) {
    if (inputOptions.spectra[experiment] && predictedSpectra[experiment]) {
      const spectrum = predictedSpectra[experiment];
      switch (experiment) {
        case 'proton':
        case 'carbon': {
          const datum = generated1DSpectrum({
            spectrum,
            inputOptions,
            experiment,
            color,
          });
          spectra.push(datum);
          break;
        }
        case 'cosy':
        case 'hsqc':
        case 'hmbc': {
          const datum = generated2DSpectrum({
            spectrum,
            inputOptions,
            experiment,
            color,
          });
          spectra.push(datum);
          break;
        }
        default:
          break;
      }
    }
  }
  return spectra;
}

function checkFromTo(
  predictedSpectra: PredictedSpectraResult,
  inputOptions: PredictionOptions,
  logger: Logger,
) {
  const { autoExtendRange, spectra } = inputOptions;
  const originalFromTo = {
    '1H': { ...inputOptions['1d']['1H'] },
    '13C': { ...inputOptions['1d']['13C'] },
  };
  for (const experiment in predictedSpectra) {
    if (!spectra[experiment]) continue;
    if (['carbon', 'proton'].includes(experiment)) {
      const spectrum = predictedSpectra[experiment] as Prediction1D;
      const { signals, nucleus } = spectrum;
      const { from, to } = inputOptions['1d'][nucleus];
      const fromTo = getNewFromTo({
        deltas: signals.map((s) => s.delta),
        from,
        to,
        nucleus,
        autoExtendRange,
      });
      inputOptions['1d'][nucleus].to = fromTo.to;
      inputOptions['1d'][nucleus].from = fromTo.from;
    } else {
      checkTwoDSpectrum(
        predictedSpectra[experiment] as Prediction2D,
        inputOptions,
      );
    }
  }
  for (const nucleus of ['1H', '13C']) {
    const { from, to } = inputOptions['1d'][nucleus];
    const { from: oFrom, to: oTo } = originalFromTo[nucleus];
    if (oFrom > from || oTo < to) {
      if (autoExtendRange) {
        logger.warn(
          `There are ${nucleus} signals out of the range, it was extended to ${from}-${to}.`,
        );
      } else {
        logger.warn(`There are ${nucleus} signals out of the range.`);
      }
    }
  }
}

function checkTwoDSpectrum(
  spectrum: Prediction2D,
  inputOptions: PredictionOptions,
) {
  const { signals, nuclei } = spectrum;

  if (signals.length === 0) return;
  const { autoExtendRange } = inputOptions;

  for (const nucleus of nuclei) {
    const axis = nucleus === '1H' ? 'x' : 'y';
    const { from, to } = inputOptions['1d'][nucleus];
    const fromTo = getNewFromTo({
      deltas: signals.map((s) => s[axis].delta),
      from,
      to,
      nucleus,
      autoExtendRange,
    });
    inputOptions['1d'][nucleus].from = fromTo.from;
    inputOptions['1d'][nucleus].to = fromTo.to;
  }
}

function getNewFromTo(params: {
  deltas: number[];
  from: number;
  to: number;
  nucleus: string;
  autoExtendRange: boolean;
}) {
  let { deltas, nucleus, from, to, autoExtendRange } = params;
  const { min, max } = xMinMaxValues(deltas);
  if (autoExtendRange && (from > min || to < max)) {
    const spread = nucleus === '1H' ? 0.2 : 2;
    if (from > min) from = min - spread;
    if (to < max) to = max + spread;
  }
  return { from, to };
}

function generated1DSpectrum(params: {
  inputOptions: PredictionOptions;
  spectrum: any;
  experiment: string;
  color: string;
}) {
  const { spectrum, inputOptions, experiment, color } = params;

  const { signals, joinedSignals, nucleus } = spectrum;

  const {
    name,
    '1d': { nbPoints },
    frequency: freq,
  } = inputOptions;
  const SpectrumName = generateName(name, { frequency: freq, experiment });
  const frequency = calculateFrequency(nucleus, freq);
  const { x, y } = signalsToXY(signals, {
    ...inputOptions['1d'][nucleus],
    frequency,
    nbPoints,
  });
  const datum = initiateDatum1D(
    {
      data: { x, im: null, re: y },
      display: {
        color,
      },
      info: {
        nucleus,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: 'prediction',
        solvent: '',
        experiment,
        isFt: true,
        name: SpectrumName,
        title: SpectrumName,
      },
    },
    {},
  );
  datum.ranges.values = mapRanges(
    signalsToRanges(joinedSignals, { frequency: frequency as number }),
    datum,
  );
  updateIntegralsRelativeValues(datum);
  return datum;
}

function mapZones(zones: Array<Partial<Zone>>) {
  return zones.map((zone: any) => {
    const { signals, ...resZone } = zone;
    const newSignals = signals.map((signal: Signal2D) => {
      const { x, y, id, ...resSignal } = signal;
      return {
        id: id || v4(),
        kind: 'signal',
        x: { ...x, originDelta: x.delta || 0 },
        y: { ...y, originDelta: y.delta || 0 },
        ...resSignal,
      };
    });
    return {
      id: v4(),
      ...resZone,
      signals: newSignals,
      kind: DatumKind.signal,
    };
  });
}

function generated2DSpectrum(params: {
  inputOptions: PredictionOptions;
  spectrum: any;
  experiment: string;
  color: string;
}) {
  const { spectrum, inputOptions, experiment, color } = params;
  const { signals, zones, nuclei } = spectrum;
  const xOption = inputOptions['1d'][nuclei[0]];
  const yOption = inputOptions['1d'][nuclei[1]];

  const width = get2DWidth(nuclei);
  const frequency = calculateFrequency(nuclei, inputOptions.frequency);

  const minMaxContent = signals2DToZ(signals, {
    from: { x: xOption.from, y: yOption.from },
    to: { x: xOption.to, y: yOption.to },
    nbPoints: {
      x: inputOptions['2d'].nbPoints.x,
      y: inputOptions['2d'].nbPoints.y,
    },
    width,
    factor: 3,
  });
  const SpectrumName = generateName(inputOptions.name, {
    frequency,
    experiment,
  });
  const spectralWidth = getSpectralWidth(experiment, inputOptions);
  const datum = initiateDatum2D(
    {
      data: { rr: { ...minMaxContent, noise: 0.01 } },
      display: {
        positiveColor: color,
        negativeColor: adjustAlpha(color, 40),
      },
      info: {
        name: SpectrumName,
        title: SpectrumName,
        nucleus: nuclei,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: 'prediction',
        spectralWidth,
        experiment,
      },
    },
    [],
  );
  datum.zones.values = mapZones(zones);
  return datum;
}

function get2DWidth(nucleus: string[]) {
  return nucleus[0] === nucleus[1] ? 0.02 : { x: 0.02, y: 0.2133 };
}

function getSpectralWidth(experiment: string, options: PredictionOptions) {
  const formTo = options['1d'];

  switch (experiment) {
    case 'cosy': {
      const { from, to } = formTo['1H'];
      const diff = to - from;
      return [diff, diff];
    }
    case 'hsqc':
    case 'hmbc': {
      const proton = formTo['1H'];
      const carbon = formTo['13C'];
      const protonDiff = proton.to - proton.from;
      const carbonDiff = carbon.to - carbon.from;

      return [protonDiff, carbonDiff];
    }
    default:
      return [];
  }
}

function calculateFrequency(
  nucleus: string | string[],
  frequency: number,
): number | number[] {
  if (typeof nucleus === 'string') {
    return getFrequency(nucleus, { nucleus: '1H', frequency });
  } else if (nucleus[0] === nucleus[1]) {
    return [frequency, frequency];
  } else {
    return [
      frequency,
      getFrequency(nucleus[1], {
        nucleus: nucleus[0],
        frequency,
      }),
    ];
  }
}
