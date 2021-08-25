import { predictAll, signalsToXY, signals2DToZ } from 'nmr-processing';
import OCL from 'openchemlib/full';

import { PredictionProps } from '../component/modal/PredictSpectraModal';

import { DatumKind } from './constants/SignalsKinds';
import {
  Datum1D,
  initiateDatum1D,
  mapRanges,
  updateIntegralRanges,
} from './data1d/Spectrum1D';
import { Datum2D, initiateDatum2D, Signal, Zone } from './data2d/Spectrum2D';
import generateID from './utilities/generateID';

const baseURL = 'https://nmr-prediction.service.zakodium.com';

export async function predictSpectra(molfile: string): Promise<any> {
  const molecule = OCL.Molecule.fromMolfile(molfile);

  return predictAll(molecule, {
    predictOptions: {
      C: {
        webserviceURL: `${baseURL}/v1/predict/carbon`,
      },
    },
  });
}

export function generateSpectra(
  data: Record<string, any>,
  inputOptions: PredictionProps,
  usedColors: Array<string> = [],
): Array<Datum1D | Datum2D> {
  const spectra: Array<Datum1D | Datum2D> = [];
  for (const experiment in data) {
    if (inputOptions.spectra[experiment]) {
      const spectrum = data[experiment];
      switch (experiment) {
        case 'proton':
        case 'carbon': {
          const datum = generated1DSpectrum({
            spectrum,
            inputOptions,
            experiment,
            usedColors,
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
            usedColors,
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

function generated1DSpectrum(params: {
  inputOptions: PredictionProps;
  spectrum: any;
  experiment: string;
  usedColors: string[];
}) {
  const { spectrum, inputOptions, experiment, usedColors } = params;

  const { signals, ranges, nucleus } = spectrum;

  const {
    '1d': { nbPoints },
    frequency: freq,
  } = inputOptions;

  const frequency = getFrequency(nucleus, freq);
  const { x, y } = signalsToXY(signals, {
    ...inputOptions['1d'][nucleus],
    frequency,
    nbPoints,
  });
  const datum = initiateDatum1D(
    {
      data: { x, im: null, re: y },
      info: {
        nucleus,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: 'prediction',
        solvent: '',
        experiment,
      },
    },
    usedColors,
  );
  datum.ranges.values = mapRanges(ranges, datum);
  updateIntegralRanges(datum);
  return datum;
}

function mapZones(zones: Array<Partial<Zone>>) {
  return zones.reduce<Array<Zone>>((zonesAcc, zone: any) => {
    const { signals, ...resZone } = zone;
    const newSignals = (signals as Array<Partial<Signal>>).reduce<
      Array<Partial<Signal>>
    >((signalsAcc, signal) => {
      const { x, y, ...resSignal } = signal;
      signalsAcc.push({
        id: generateID(),
        kind: 'signal',
        x: { ...x, originDelta: x?.delta },
        y: { ...y, originDelta: y?.delta },
        ...resSignal,
      });
      return signalsAcc;
    }, []);

    zonesAcc.push({
      id: generateID(),
      ...resZone,
      signals: newSignals,
      kind: DatumKind.signal,
    });
    return zonesAcc;
  }, []);
}

function generated2DSpectrum(params: {
  inputOptions: PredictionProps;
  spectrum: any;
  experiment: string;
  usedColors: string[];
}) {
  const { spectrum, inputOptions, experiment, usedColors } = params;
  const { signals, zones, nucleus } = spectrum;

  const xOption = inputOptions['1d'][nucleus[0]];
  const yOption = inputOptions['1d'][nucleus[1]];

  const width = get2DWidth(nucleus);
  const frequency = getFrequency(nucleus, inputOptions.frequency);

  const spectrumData = signals2DToZ(signals, {
    from: { x: xOption.from, y: yOption.from },
    to: { x: xOption.to, y: yOption.to },
    nbPoints: {
      x: inputOptions['2d'].nbPoints.x,
      y: inputOptions['2d'].nbPoints.y,
    },
    width,
  });

  const datum = initiateDatum2D(
    {
      data: { ...spectrumData, noise: 0.01 },
      info: {
        nucleus,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: experiment,
        experiment: '2d',
      },
    },
    usedColors,
  );
  datum.zones.values = mapZones(zones);
  return datum;
}

function get2DWidth(nucleus: string[]) {
  return nucleus[0] === nucleus[1] ? 0.03 : { x: 0.03, y: 0.32 };
}

function getFrequency(
  nucleus: string | string[],
  inputFrequency: number,
): number | string {
  const ration13C = 0.25;

  if (typeof nucleus === 'string') {
    return nucleus === '13C' ? inputFrequency * ration13C : inputFrequency;
  } else {
    if (nucleus[0] === nucleus[1]) {
      return `${inputFrequency},${inputFrequency}`;
    } else {
      return `${inputFrequency},${inputFrequency * ration13C}`;
    }
  }
}
