import type { Spectrum } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

import type { State } from '../Reducer.ts';
import type { ActionType } from '../types/ActionType.ts';

type SetSpectrumAction = ActionType<
  'SET_SPECTRUM',
  {
    index: number;
    spectrum: Spectrum;
    onProduce: (draft: Draft<State>, processedSpectrum: Spectrum) => void;
  }
>;

type SetTempSpectra = ActionType<
  'SET_TEMP_SPECTRA',
  { spectra: Spectrum[] | undefined }
>;

export type ProcessingsActions = SetSpectrumAction | SetTempSpectra;

export function setSpectrum(draft: Draft<State>, action: SetSpectrumAction) {
  const { index, spectrum, onProduce } = action.payload;

  draft.data[index] = spectrum;

  onProduce(draft, spectrum);
}

export function setTempSpectra(draft: Draft<State>, action: SetTempSpectra) {
  const { spectra } = action.payload;

  draft.tempData = spectra;
}
