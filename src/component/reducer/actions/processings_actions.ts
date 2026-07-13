import type { Spectrum } from '@zakodium/nmrium-core';
import { assertDefinedNotNull } from '@zakodium/utils';
import type { Draft } from 'immer';

import type { State } from '../Reducer.ts';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.ts';
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
  {
    spectra: Spectrum[] | undefined;
    onProduce?: (draft: Draft<State>, processedSpectrum: Spectrum) => void;
  }
>;

export type ProcessingsActions = SetSpectrumAction | SetTempSpectra;

export function setSpectrum(draft: Draft<State>, action: SetSpectrumAction) {
  const { index, spectrum, onProduce } = action.payload;

  draft.data[index] = spectrum;

  onProduce(draft, spectrum);
}

export function setTempSpectra(draft: Draft<State>, action: SetTempSpectra) {
  const { spectra, onProduce } = action.payload;

  const active = getActiveSpectrum(draft);
  assertDefinedNotNull(active);

  draft.tempData = spectra;
  onProduce?.(
    draft,
    draft.tempData.find((s: Spectrum) => s.id === active.id),
  );
}
