import type {
  ProcessingOperatorId,
  SpectrumProcessingOperation,
} from '@zakodium/nmr-types';
import type { ProcessingOperatorUI, Spectrum } from '@zakodium/nmrium-core';
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
    updateView: boolean;
  }
>;

type SelectProcessingOperator = ActionType<
  'SELECT_PROCESSING_OPERATOR',
  {
    operatorUI: ProcessingOperatorUI<ProcessingOperatorId> | undefined;
  }
>;

type SetLiveEditChecked = ActionType<'SET_LIVE_EDIT_CHECKED', boolean>;
type SetLiveEditShouldProcessNext = ActionType<
  'SET_LIVE_EDIT_SHOULD_PROCESS_NEXT',
  boolean
>;
type SetLiveOperation = ActionType<
  'SET_LIVE_OPERATION',
  {
    liveOperation: SpectrumProcessingOperation<unknown, unknown> | undefined;
  }
>;

export type ProcessingsActions =
  | SetSpectrumAction
  | SetSpectrumLiveProcessed
  | SelectProcessingOperator
  | SetLiveEditChecked
  | SetLiveEditShouldProcessNext
  | SetLiveOperation;

export function setSpectrum(draft: Draft<State>, action: SetSpectrumAction) {
  const { index, spectrum, onProduce } = action.payload;

  draft.data[index] = spectrum;

  onProduce(draft);
}

export function setSpectrumLiveProcessed(
  draft: Draft<State>,
  action: SetSpectrumLiveProcessed,
) {
  const { spectrumLiveProcessed, updateView } = action.payload;

  draft.spectrumLiveProcessed = spectrumLiveProcessed;

  if (!updateView) return;

  updateLiveProcessedView(draft);
}

export function selectProcessingOperator(
  draft: Draft<State>,
  { payload }: SelectProcessingOperator,
) {
  const { operatorUI } = payload;

  draft.processingOperators.selected = operatorUI?.id;
  draft.processingOperators.liveEdit = operatorUI?.isLiveEditable
    ? {
        checked: true,
        shouldProcessNext: operatorUI.defaultShouldProcessAll ?? false,
      }
    : undefined;

  if (!operatorUI) {
    draft.processingOperators.liveOperation = undefined;
    setSpectrumLiveProcessed(draft, {
      type: 'SET_SPECTRUM_LIVE_PROCESSED',
      payload: { spectrumLiveProcessed: undefined, updateView: true },
    });
  }
}

export function setLiveEditChecked(
  draft: Draft<State>,
  { payload }: SetLiveEditChecked,
) {
  if (!draft.processingOperators.liveEdit) return;

  draft.processingOperators.liveEdit.checked = payload;
}

export function setLiveEditShouldProcessNext(
  draft: Draft<State>,
  { payload }: SetLiveEditShouldProcessNext,
) {
  if (!draft.processingOperators.liveEdit) return;

  draft.processingOperators.liveEdit.shouldProcessNext = payload;
}

export function setLiveOperation(
  draft: Draft<State>,
  { payload: { liveOperation } }: SetLiveOperation,
) {
  draft.processingOperators.liveOperation = liveOperation;
}

function updateLiveProcessedView(draft: Draft<State>) {
  setDomain(draft);
  setMode(draft);
  changeSpectrumVerticalAlignment(draft, {
    verticalAlign: 'auto-check',
  });
}
