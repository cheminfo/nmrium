import { Draft } from 'immer';

import { State } from '../Reducer';

export function getActiveSpectrum(state: Draft<State> | State) {
  const { activeSpectra, activeTab } = state.view.spectra;
  return activeSpectra[activeTab] || null;
}
