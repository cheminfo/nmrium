import get from 'lodash/get';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';

interface ActiveSpectrumOptionsResult {
  isActive: boolean;
  opacity: number;
}

export default function useActiveSpectrumStyleOptions(
  id: string,
): ActiveSpectrumOptionsResult {
  const { activeSpectrum } = useChartData();
  const preferences = usePreferences();

  return useMemo(() => {
    const isActive =
      activeSpectrum === null ? true : id === activeSpectrum.id ? true : false;
    const opacity = isActive
      ? 1
      : get(preferences.current, 'controllers.dimmedSpectraTransparency', 0.1);
    return { isActive, opacity };
  }, [activeSpectrum, id, preferences]);
}
