import type { Draft } from 'immer';
import type { RangesViewState } from 'nmr-load-save';

import { defaultRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import type { State } from '../Reducer.js';

import { getActiveSpectrum } from './getActiveSpectrum.js';

export function setRangesViewProperty<T extends keyof RangesViewState>(
  draft: Draft<State>,
  key: T,
  value: (value: RangesViewState[T]) => RangesViewState[T],
): void;
export function setRangesViewProperty<T extends keyof RangesViewState>(
  draft: Draft<State>,
  key: T,
  value: RangesViewState[T],
): void;

export function setRangesViewProperty<T extends keyof RangesViewState>(
  draft: Draft<State>,
  key: T,
  value:
    | ((value: RangesViewState[T]) => RangesViewState[T])
    | RangesViewState[T],
) {
  const rangesView = draft.view.ranges;

  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum?.id) return;

  const id = activeSpectrum.id;

  initializeRangeViewObject(draft, id);

  rangesView[id][key] =
    typeof value === 'function' ? value(rangesView[id][key]) : value;
}

export function initializeRangeViewObject(
  draft: Draft<State>,
  spectrumID: string,
) {
  const rangesView = draft.view.ranges;

  if (spectrumID in rangesView) return;

  const defaultRangesView = { ...defaultRangesViewState };
  rangesView[spectrumID] = defaultRangesView;
}
