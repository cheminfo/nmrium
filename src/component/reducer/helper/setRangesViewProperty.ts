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
  const viewData = draft.view.ranges;

  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum?.id) return;

  const id = activeSpectrum.id;

  if (viewData[id]) {
    viewData[id][key] =
      typeof value === 'function' ? value(viewData[id][key]) : value;
  } else {
    const defaultView = { ...defaultRangesViewState };
    defaultView[key] =
      typeof value === 'function' ? value(defaultView[key]) : value;
    viewData[id] = defaultView;
  }
}
