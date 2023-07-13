export type SpinSystemData = (number | null)[][];

export interface SimulationOptions {
  data: SpinSystemData;
  frequency: number;
  from: number;
  to: number;
  nbPoints: number;
  lineWidth: number;
}

export const defaultSimulationOptions: SimulationOptions = {
  data: [],
  frequency: 400,
  from: -1,
  to: 12,
  nbPoints: 2 ** 17,
  lineWidth: 1,
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

export function mapSpinSystem(
  spinSystem: string,
  spinsData: (number | null)[][],
) {
  const spinsLength = spinSystem.length;
  const chemicalShifts: number[] = new Array(spinsLength);
  const multiplicity: number[] = new Array(spinsLength);

  for (let i = 0; i < spinsLength; i++) {
    chemicalShifts[i] = spinsData[i][0] as number;
    multiplicity[i] = 2;
  }

  const chemicalShiftsLength = chemicalShifts.length;

  const coupling = new Array(chemicalShiftsLength);
  for (let i = 0; i < chemicalShiftsLength; i++) {
    coupling[i] = new Array(chemicalShiftsLength);
    for (let j = 0; j < chemicalShiftsLength; j++) {
      coupling[i][j] = 0;
    }
  }

  for (let i = 0; i < spinsData.length; i++) {
    for (let j = 1; j < chemicalShiftsLength; j++) {
      const couplingVal = spinsData[i][j];
      if (couplingVal !== null) {
        coupling[i][j] = couplingVal;
        coupling[j][i] = couplingVal;
      }
    }
  }
  return { chemicalShifts, coupling, multiplicity };
}
