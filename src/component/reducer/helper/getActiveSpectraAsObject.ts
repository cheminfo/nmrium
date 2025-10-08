import type { Draft } from 'immer';

import type { State } from '../Reducer.js';

import { getActiveSpectra } from './getActiveSpectra.js';

export function getActiveSpectraAsObject(
  state: Draft<State> | State,
): Record<string, number> | null {
  const activeSpectra = getActiveSpectra(state);

  if (!activeSpectra || activeSpectra?.length === 0) return null;

  const activeSpectraObject: Record<string, number> = {};
  for (const activeSpectrum of activeSpectra) {
    activeSpectraObject[activeSpectrum.id] = activeSpectrum.index;
  }

  return activeSpectraObject;
}
