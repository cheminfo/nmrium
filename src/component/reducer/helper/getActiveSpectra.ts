import { Draft } from 'immer';

import { State } from '../Reducer';

export function getActiveSpectra(state: Draft<State> | State) {
  const { activeSpectra, activeTab } = state.view.spectra;
  const spectra = activeSpectra?.[activeTab]?.filter(
    (spectrum) => spectrum?.selected,
  );

  return Array.isArray(spectra) && spectra.length > 0 ? spectra : null;
}
