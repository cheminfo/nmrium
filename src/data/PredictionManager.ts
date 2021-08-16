import { predictAll, signalsToXY } from 'nmr-processing';
import OCL from 'openchemlib/full';
import { generateSpectrum2D } from 'spectrum-generator';

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
  inputOptions: {
    spectra: Record<string, boolean>;
    '1H': { from: number; to: number };
    '13C': { from: number; to: number };
  },
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

function generated1DSpectrum(params) {
  const { spectrum, inputOptions, experiment, usedColors } = params;

  const { signals, ranges, nucleus } = spectrum;
  const { x, y } = signalsToXY(signals, {
    ...inputOptions[nucleus],
  });
  const datum = initiateDatum1D(
    {
      data: { x, im: null, re: y },
      info: {
        nucleus,
        originFrequency: 600,
        baseFrequency: 600,
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

function generated2DSpectrum(params) {
  const { spectrum, inputOptions, experiment, usedColors } = params;
  const { signals, zones, nucleus } = spectrum;
  const peaks = signals.reduce(
    (acc, { x, y }) => {
      acc.x.push(x.delta);
      acc.y.push(y.delta);
      acc.z.push(100);
      return acc;
    },
    { x: [], y: [], z: [] },
  );
  const xOption = inputOptions[nucleus[0]];
  const yOption = inputOptions[nucleus[1]];
  const interval = { x: 0.02, y: 0.02 };
  if (nucleus[0] !== nucleus[1]) interval.y = 0.05;
  const width = nucleus[0] === nucleus[1] ? 0.02 : { x: 0.02, y: 0.08 };
  const spectrumData = generateSpectrum2D(peaks, {
    generator: {
      from: { x: xOption.from, y: yOption.from },
      to: { x: xOption.to, y: yOption.to },
      nbPoints: {
        x: getNbPoints(xOption.from, xOption.to, interval.x),
        y: getNbPoints(yOption.from, yOption.to, interval.y),
      },
      peakWidthFct: () => width,
    },
  });
  const datum = initiateDatum2D(
    {
      data: { ...spectrumData, noise: 0.01 },
      info: {
        nucleus,
        pulseSequence: experiment,
        experiment: '2d',
      },
    },
    usedColors,
  );

  datum.zones.values = mapZones(zones);
  return datum;
}

function getNbPoints(from, to, interval) {
  return Math.ceil(Math.abs(from - to) / interval - 1);
}
