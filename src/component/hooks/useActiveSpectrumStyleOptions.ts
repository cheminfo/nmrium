import get from 'lodash/get';
import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';
import { useActiveSpectrum } from '../reducer/Reducer';

interface ActiveSpectrumOptionsResult {
  isActive: boolean;
  opacity: number;
}

export default function useActiveSpectrumStyleOptions(
  id: string,
): ActiveSpectrumOptionsResult {
  const activeSpectrum = useActiveSpectrum();
  const preferences = usePreferences();

  return useMemo(() => {
    const isActive = activeSpectrum === null ? true : id === activeSpectrum.id;
    const opacity = isActive
      ? 1
      : get(preferences.current, 'general.dimmedSpectraOpacity', 0.1);
    return { isActive, opacity };
  }, [activeSpectrum, id, preferences]);
}
