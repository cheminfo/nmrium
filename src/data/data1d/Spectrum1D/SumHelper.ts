import { Molecule } from '../../molecules/Molecule';
import { Integrals, Ranges } from '../../types/data1d';
import { Options } from '../../types/data1d/Options';
import getAtom from '../../utilities/getAtom';

export interface SumParams {
  nucleus: string;
  molecules: Molecule[];
}

export interface SetSumOptions {
  sum: number | null;
  mf: {
    value: string;
    moleculeKey: string;
  } | null;
}

export function initSumOptions(options: Options, params: SumParams) {
  const newOptions = { ...options };
  const { molecules, nucleus } = params;

  if (
    !options.sum &&
    !options.mf &&
    Array.isArray(molecules) &&
    molecules.length > 0
  ) {
    const { mf, key } = molecules[0];
    newOptions.mf = { value: mf, moleculeKey: key };
  }
  if (!options.sum) {
    newOptions.sum = getSum(newOptions.mf?.value || null, nucleus);
  }

  return newOptions;
}

export function getSum(mf: string | null, nucleus: string) {
  if (!mf || !nucleus) return 100;

  const atom = getAtom(nucleus);
  const atoms = getAtoms(mf);

  return atoms[atom] ? atoms[atom] : 100;
}

export function setSumOptions(
  data: Ranges | Integrals,
  params: { options: SetSumOptions; nucleus: string },
) {
  const { nucleus, options } = params;

  if (options.mf) {
    const { value, moleculeKey } = options.mf;
    data.options.mf = { value, moleculeKey };
    data.options.sum = getSum(value, nucleus);
  } else if (options.sum) {
    data.options.sum = options.sum;
  }
}

export function getAtoms(mf: string): Record<string, number> {
  const result = {};
  // eslint-disable-next-line prefer-named-capture-group
  const data = mf.split(/(\d+)/);
  for (let i = 0; i < data.length - 1; i = i + 2) {
    result[data[i]] = Number(data[i + 1]);
  }
  return result;
}
