import type { ViewState } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

export function getActiveSpectra(
  viewSpectraState: Draft<ViewState['spectra']> | ViewState['spectra'],
) {
  const { activeSpectra, activeTab } = viewSpectraState;
  const spectra = activeSpectra?.[activeTab]?.filter(
    (spectrum) => spectrum?.selected,
  );

  return Array.isArray(spectra) && spectra.length > 0 ? spectra : null;
}
