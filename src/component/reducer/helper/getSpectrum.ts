import type { Spectrum } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

import type { State } from '../Reducer.js';

import { getActiveSpectrum } from './getActiveSpectrum.js';

type GetSpectrumReturn = Spectrum | undefined;

export function getSpectrum(state: Draft<State>): GetSpectrumReturn;
export function getSpectrum(
  state: Draft<State>,
  index: number,
): GetSpectrumReturn;
export function getSpectrum(
  state: Draft<State>,
  id?: string,
): GetSpectrumReturn;
export function getSpectrum(
  state: Draft<State>,
  value?: number | string,
): GetSpectrumReturn {
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

  return undefined;
}
