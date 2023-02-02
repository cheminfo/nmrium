import { Draft } from 'immer';

import { State } from '../Reducer';

import { getActiveSpectra } from './getActiveSpectra';

export function getActiveSpectraAsObject(
  state: Draft<State> | State,
): Record<string, number> | null {
  const activeSpectra = getActiveSpectra(state);

  if (!activeSpectra || activeSpectra?.length === 0) return null;

  const activeSpectraObject = {};
  for (const activeSpectrum of activeSpectra) {
    activeSpectraObject[activeSpectrum.id] = activeSpectrum.index;
  }

  return activeSpectraObject;
}

export function isActiveSpectrum(
  activeSpectra: Record<string, number> | null,
  id: string,
) {
  return !!(activeSpectra && id in activeSpectra);
}
