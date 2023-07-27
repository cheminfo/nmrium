import { simulate1D } from 'nmr-processing';

export type SpinSystemData = Array<Array<number | null>>;

export interface SpectrumSimulationOptions {
  data: SpinSystemData;
  options: {
    frequency: number;
    from: number;
    to: number;
    nbPoints: number;
    lineWidth: number;
  };
}

export const defaultSimulationOptions: SpectrumSimulationOptions = {
  data: [],
  options: {
    frequency: 200,
    from: -1,
    to: 12,
    nbPoints: 2 ** 16,
    lineWidth: 1,
  },
};

export function getSpinSystems() {
  const spinSystem: string[] = [];
  let temp = 'A';
  for (let i = 66; i <= 72; i++) {
    temp += String.fromCodePoint(i);
    spinSystem.push(temp);
  }
  return spinSystem;
}

export function simulateSpectrum(
  spinSystem: string,
  options: SpectrumSimulationOptions,
) {
  const spinsLength = spinSystem.length;
  const chemicalShifts: number[] = new Array(spinsLength);
  const multiplicity: number[] = new Array(spinsLength);

  const { data: spinsData, options: simulateOptions } = options;

  for (let i = 0; i < spinsLength; i++) {
    chemicalShifts[i] = spinsData[i][0] as number;
    multiplicity[i] = 2;
  }

  const chemicalShiftsLength = chemicalShifts.length;

  const couplingConstants = new Array<number[]>(chemicalShiftsLength);
  for (let i = 0; i < chemicalShiftsLength; i++) {
    couplingConstants[i] = new Array<number>(chemicalShiftsLength);
    for (let j = 0; j < chemicalShiftsLength; j++) {
      couplingConstants[i][j] = 0;
    }
  }

  for (let i = 0; i < spinsData.length; i++) {
    for (let j = 1; j < chemicalShiftsLength; j++) {
      const couplingVal = spinsData[i][j];
      const jIndex = j - 1;
      if (couplingVal !== null) {
        couplingConstants[i][jIndex] = couplingVal;
        couplingConstants[jIndex][i] = couplingVal;
      }
    }
  }

  return simulate1D(
    {
      chemicalShifts,
      couplingConstants,
      levels: multiplicity,
    },
    simulateOptions,
  );
}
