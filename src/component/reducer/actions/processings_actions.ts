import type { ProcessingOperatorId, Spectrum } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

import type { State } from '../Reducer.ts';
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

type SelectProcessingOperator = ActionType<
  'SELECT_PROCESSING_OPERATOR',
  {
    operatorId: ProcessingOperatorId | undefined;
  }
>;

export type ProcessingsActions =
  SetSpectrumAction | SetSpectrumLiveProcessed | SelectProcessingOperator;

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

export function selectProcessingOperator(
  draft: Draft<State>,
  { payload }: SelectProcessingOperator,
) {
  const { operatorId } = payload;

  draft.processingOperators.selected = operatorId;
}

function updateLiveProcessedView(draft: Draft<State>) {
  setDomain(draft);
  setMode(draft);
  changeSpectrumVerticalAlignment(draft, {
    verticalAlign: 'auto-check',
  });
}
