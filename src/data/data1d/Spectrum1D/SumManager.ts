import type { Integrals, Ranges, SumOptions } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import { MF } from 'mf-parser';

import type { State } from '../../../component/reducer/Reducer.js';
import type { StateMoleculeExtended } from '../../molecules/Molecule.js';
import getAtom from '../../utilities/getAtom.js';

import {
  isSpectrum1D,
  updateIntegralsRelativeValues,
  updateRangesRelativeValues,
} from './index.js';

export interface SumParams {
  nucleus: string;
  molecules: StateMoleculeExtended[];
}

export type SetSumOptions = Omit<SumOptions, 'isSumConstant'>;

export function initSumOptions(
  options: Partial<SumOptions>,
  params: SumParams,
) {
  let newOptions: SumOptions = {
    sum: undefined,
    isSumConstant: true,
    sumAuto: true,
    ...options,
  };
  const { molecules, nucleus } = params;

  if (options.sumAuto && Array.isArray(molecules) && molecules.length > 0) {
    const { mf, id } = molecules[0];
    newOptions = { ...newOptions, sumAuto: true, mf, moleculeId: id };
  } else {
    const { mf, moleculeId, ...resOptions } = newOptions;
    newOptions = { ...resOptions, sumAuto: false };
  }
  if (!newOptions.sum) {
    newOptions.sum = getSum(newOptions.mf || null, nucleus);
  }

  return newOptions;
}

export function getSum(mf: string | null | undefined, nucleus: string) {
  const defaultSum = 100;

  if (!mf || !nucleus) return defaultSum;

  const atom = getAtom(nucleus);
  const atoms = new MF(mf).getInfo().atoms;

  return atoms[atom] || defaultSum;
}

export function setSumOptions(
  data: Ranges | Integrals,
  params: { options: SetSumOptions; nucleus: string },
) {
  const { nucleus, options } = params;
  if (options.sumAuto) {
    const { mf, moleculeId } = options;
    const sum = getSum(mf, nucleus);
    data.options = {
      ...data.options,
      sumAuto: true,
      moleculeId,
      mf,
      sum,
    };
  } else {
    const { mf, moleculeId, ...resOptions } = data.options;
    data.options = { ...resOptions, sumAuto: false, sum: options.sum };
  }
}

/**
 * change the sum for ranges and integrals in all spectra based on molecule
 * it handle three cases
 * 1 - edit and existing molecule
 * 2- delete molecule / edit molecule and as a result of that it generate more than one molecule
 * 3- add a molecule for the first time
 * @param draft     State draft
 * @param molId    Molecule id
 * @param molecule  Molecules list
 */
export function changeSpectraRelativeSum(
  draft: Draft<State>,
  molId: string,
  molecule: StateMoleculeExtended,
) {
  const keys: Array<keyof Spectrum1D> = ['ranges', 'integrals'];

  for (const spectrum of draft.data) {
    if (isSpectrum1D(spectrum)) {
      for (const key of keys) {
        const { moleculeId, mf, sumAuto } = spectrum[key].options;

        if ((molId === moleculeId || (!moleculeId && !mf)) && sumAuto) {
          const options: Partial<SetSumOptions> = molecule
            ? {
                mf: molecule.mf,
                moleculeId: molecule.id,
              }
            : {
                mf: undefined,
                moleculeId: undefined,
              };

          setSumOptions(spectrum[key], {
            nucleus: spectrum.info.nucleus,
            options: { ...options, sumAuto: true, sum: undefined },
          });
          updateRangesRelativeValues(spectrum, true);
          updateIntegralsRelativeValues(spectrum, true);
        }
      }
    }
  }
}
