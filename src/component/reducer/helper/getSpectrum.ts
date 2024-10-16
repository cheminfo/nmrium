import type { Draft } from 'immer';

import type { State } from '../Reducer.js';

import { getActiveSpectrum } from './getActiveSpectrum.js';

export function getSpectrum(state: Draft<State>);
export function getSpectrum(state: Draft<State>, index: number);
export function getSpectrum(state: Draft<State>, id: string);

export function getSpectrum(state: Draft<State>, value?: number | string) {
  const activeSpectrum = getActiveSpectrum(state);

  if (value === undefined && activeSpectrum?.id) {
    const index = activeSpectrum.index;
    return state.data[index];
  }

  if (typeof value === 'number') {
    return state.data[value] || undefined;
  }

  if (typeof value === 'string') {
    return state.data.find((spectrum) => spectrum.id === value);
  }
}
