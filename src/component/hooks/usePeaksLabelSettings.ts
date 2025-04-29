import type { PeaksLabel } from '@zakodium/nmrium-core';

import { usePreferences } from '../context/PreferencesContext.js';

const peaksLabelDefaultValues: PeaksLabel = {
  marginTop: 0,
};

export function usePeaksLabelSettings() {
  const { current } = usePreferences();

  return current?.peaksLabel || peaksLabelDefaultValues;
}
