import type { Spectrum } from '@zakodium/nmrium-core';
import { assertDefinedNotNull } from '@zakodium/utils';
import type { Draft } from 'immer';

import type { State } from '../Reducer.ts';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.ts';
import type { ActionType } from '../types/ActionType.ts';

import { setDomain, setMode } from './DomainActions.ts';
import { changeSpectrumVerticalAlignment } from './PreferencesActions.ts';

type SetSpectrumAction = ActionType<
  'SET_SPECTRUM',
  {
    index: number;
    spectrum: Spectrum;
    onProduce: (draft: Draft<State>) => void;
  }
>;

type SetSpectrumLiveProcessed = ActionType<
  'SET_SPECTRUM_LIVE_PROCESSED',
  {
    spectrumLiveProcessed: Spectrum | undefined;
  }
>;

export type ProcessingsActions = SetSpectrumAction | SetSpectrumLiveProcessed;

export function setSpectrum(draft: Draft<State>, action: SetSpectrumAction) {
  const { index, spectrum, onProduce } = action.payload;

  draft.data[index] = spectrum;

  onProduce(draft);
}

export function setSpectrumLiveProcessed(
  draft: Draft<State>,
  action: SetSpectrumLiveProcessed,
) {
  const { spectrumLiveProcessed } = action.payload;

  draft.spectrumLiveProcessed = spectrumLiveProcessed;

  updateLiveProcessedView(draft);
}

function updateLiveProcessedView(draft: Draft<State>) {
  setDomain(draft);
  setMode(draft);
  changeSpectrumVerticalAlignment(draft, {
    verticalAlign: 'auto-check',
  });
}
