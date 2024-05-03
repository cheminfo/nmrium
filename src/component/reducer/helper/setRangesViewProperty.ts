import { Draft } from 'immer';
import { RangesViewState } from 'nmr-load-save';

import { defaultRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import { State } from '../Reducer';

import { getActiveSpectrum } from './getActiveSpectrum';

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
