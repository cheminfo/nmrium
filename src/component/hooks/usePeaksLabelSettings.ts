import { PeaksLabel } from 'nmr-load-save';

import { usePreferences } from '../context/PreferencesContext';

const peaksLabelDefaultValues: PeaksLabel = {
  marginTop: 0,
};

export function usePeaksLabelSettings() {
  const { current } = usePreferences();

  return current?.peaksLabel || peaksLabelDefaultValues;
}
