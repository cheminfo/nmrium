import { Draft } from 'immer';
import { IntegralsViewState } from 'nmr-load-save';

import { defaultIntegralsViewState } from '../../hooks/useActiveSpectrumIntegralsViewState.js';
import { State } from '../Reducer.js';

import { getActiveSpectrum } from './getActiveSpectrum.js';

export function setIntegralsViewProperty<T extends keyof IntegralsViewState>(
  draft: Draft<State>,
  key: T,
  value: (value: IntegralsViewState[T]) => IntegralsViewState[T],
): void;
export function setIntegralsViewProperty<T extends keyof IntegralsViewState>(
  draft: Draft<State>,
  key: T,
  value: IntegralsViewState[T],
): void;

export function setIntegralsViewProperty<T extends keyof IntegralsViewState>(
  draft: Draft<State>,
  key: T,
  value:
    | ((value: IntegralsViewState[T]) => IntegralsViewState[T])
    | IntegralsViewState[T],
) {
  const viewData = draft.view.integrals;

  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum?.id) return;

  const id = activeSpectrum.id;

  if (viewData[id]) {
    viewData[id][key] =
      typeof value === 'function' ? value(viewData[id][key]) : value;
  } else {
    const defaultView = { ...defaultIntegralsViewState };
    defaultView[key] =
      typeof value === 'function' ? value(defaultView[key]) : value;
    viewData[id] = defaultView;
  }
}
