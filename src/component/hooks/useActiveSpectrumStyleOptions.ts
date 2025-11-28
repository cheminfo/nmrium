import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext.js';

import { useActiveSpectra } from './useActiveSpectra.js';

interface ActiveSpectrumOptionsResult {
  isActive: boolean;
  opacity: number;
}

export default function useActiveSpectrumStyleOptions(
  id: string,
): ActiveSpectrumOptionsResult {
  const activeSpectra = useActiveSpectra();
  const preferences = usePreferences();

  return useMemo(() => {
    const index = activeSpectra?.findIndex(
      (activeSpectrum) => activeSpectrum.selected && activeSpectrum.id === id,
    );
    let isNoneSelected = false;
    isNoneSelected =
      activeSpectra?.every((activeSpectrum) => !activeSpectrum.selected) ||
      false;

    const isActive =
      activeSpectra?.length === 0 || index !== -1 || isNoneSelected;
    const opacity = isActive
      ? 1
      : // TODO: make sure preferences are not a lie and remove the optional chaining.
        (preferences?.current?.general?.dimmedSpectraOpacity ?? 0.1);
    return { isActive, opacity };
  }, [activeSpectra, id, preferences]);
}
