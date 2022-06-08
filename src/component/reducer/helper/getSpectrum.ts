import { Draft } from 'immer';

import { State } from '../Reducer';

export function getSpectrum(state: Draft<State>);
export function getSpectrum(state: Draft<State>, index: number);
export function getSpectrum(state: Draft<State>, id: string);

export function getSpectrum(state: Draft<State>, value?: number | string) {
  if (value === undefined) {
    if (state.activeSpectrum?.id) {
      const index = state.activeSpectrum.index;
      return state.data[index];
    }
  }

  if (typeof value === 'number') {
    return state.data[value] || undefined;
  }

  if (typeof value === 'string') {
    return state.data.find((spectrum) => spectrum.id === value);
  }
}
