import { useCallback } from 'react';

import { useChartData } from '../context/ChartContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import type { MainTool, ToolOptionItem } from '../toolbar/ToolTypes.js';
import { options } from '../toolbar/ToolTypes.js';

import useCheckExperimentalFeature from './useCheckExperimentalFeature.js';
import { useSelectedSpectra } from './useSelectedSpectra.ts';
import useSpectraByActiveNucleus from './useSpectraPerNucleus.ts';

export function useCheckToolsVisibility(): (toolKey: MainTool) => boolean {
  const { displayerMode } = useChartData();
  const preferences = usePreferences();
  const selectedSpectra = useSelectedSpectra();
  const spectra = useSpectraByActiveNucleus();
  const isExperimentalFeatureActivated = useCheckExperimentalFeature();
  const toolbarButtons = preferences?.current?.display?.toolBarButtons;

  return useCallback(
    (toolKey: MainTool): boolean => {
      const {
        spectraFilter,
        spectraMatch = 'all',
        selectedSpectra: selectionRules = { min: 1, max: 1 },
        mode,
        isExperimental,
      } = options[toolKey];

      // 1. Tool status
      const flag = toolbarButtons?.[toolKey] ?? false;

      const isToolActivated =
        (flag && !isExperimental) ||
        (isExperimental && isExperimentalFeatureActivated);

      if (!isToolActivated) return false;

      // 2. Mode check
      if (mode && displayerMode !== mode) return false;

      // 3. No spectra rules,  always visible
      if (!spectraFilter) return true;

      // 4. Resolve spectra source
      const spectraToCheck =
        selectedSpectra && selectedSpectra.length > 0
          ? selectedSpectra
          : spectra;

      // 5. Selection constraints
      if (selectionRules) {
        const { min, max } = selectionRules;

        if (typeof min === 'number' && spectraToCheck.length < min) {
          return false;
        }

        if (typeof max === 'number' && spectraToCheck.length > max) {
          return false;
        }
      }

      // 6. Evaluate spectra filters
      const matchCount = spectraToCheck.filter((spectrum) =>
        checkSpectrum(spectrum, spectraFilter),
      ).length;

      //  7. Match strategy
      if (spectraMatch === 'any') {
        return matchCount > 0;
      }

      return matchCount === spectraToCheck.length;
    },
    [
      displayerMode,
      isExperimentalFeatureActivated,
      toolbarButtons,
      selectedSpectra,
      spectra,
    ],
  );
}

function checkSpectrum(
  spectrum: any,
  spectraFilter: ToolOptionItem['spectraFilter'],
): boolean {
  if (!spectraFilter) return true;

  for (const option of spectraFilter) {
    if (!spectrum) continue;

    const infoConditionsMet = (option.info ?? []).every(
      ({ key, value }) => spectrum.info[key] === value,
    );

    if (infoConditionsMet) return true;
  }

  return false;
}
