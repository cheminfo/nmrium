import type { Draft } from 'immer';

import type { State } from '../Reducer.js';

export function getActiveSpectra(state: Draft<State> | State) {
  const { activeSpectra, activeTab } = state.view.spectra;
  const spectra = activeSpectra?.[activeTab]?.filter(
    (spectrum) => spectrum?.selected,
  );

  return Array.isArray(spectra) && spectra.length > 0 ? spectra : null;
}
