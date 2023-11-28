import { Draft } from 'immer';

import { State } from '../Reducer';

export function getActiveSpectrum(state: Draft<State> | State) {
  const { activeSpectra, activeTab } = state.view.spectra;

  const spectra = activeSpectra[activeTab];
  if (spectra?.length === 1 && spectra[0]?.selected) {
    return spectra[0];
  }

  return null;
}
