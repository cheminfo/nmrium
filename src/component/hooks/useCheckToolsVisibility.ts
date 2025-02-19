import type { Info1D, Info2D } from 'nmr-processing';
import { useCallback } from 'react';

import { useChartData } from '../context/ChartContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import type { Tool, ToolOptionItem } from '../toolbar/ToolTypes.js';
import { options } from '../toolbar/ToolTypes.js';

import useCheckExperimentalFeature from './useCheckExperimentalFeature.js';
import useSpectrum from './useSpectrum.js';

type SpectrumInfo = Info1D | Info2D;

export interface CheckOptions {
  checkSpectrumType?: boolean;
  checkMode?: boolean;
  extraInfoCheckParameters?: SpectrumInfo;
}

export function useCheckToolsVisibility(): (
  toolKey: Tool,
  checkOptions?: CheckOptions,
) => boolean {
  const { displayerMode } = useChartData();
  const preferences = usePreferences();
  const spectrum = useSpectrum(null);
  const isExperimentalFeatureActivated = useCheckExperimentalFeature();

  return useCallback(
    (toolKey: Tool, checkOptions: CheckOptions = {}) => {
      const {
        checkMode = true,
        checkSpectrumType = true,
        extraInfoCheckParameters,
      } = checkOptions;

      const { spectraOptions, mode, isExperimental } = options[toolKey];

      // TODO: make sure preferences are not a lie and remove the optional chaining.
      const flag =
        preferences?.current?.display?.toolBarButtons?.[toolKey] ?? false;

      const modeFlag =
        !checkMode || (checkMode && (!mode || displayerMode === mode));

      const spectrumCheckFlag =
        !checkSpectrumType ||
        (checkSpectrumType && checkSpectrum(spectrum, spectraOptions));

      const isToolActivated =
        (flag && !isExperimental) ||
        (isExperimental && isExperimentalFeatureActivated);
      return !!(
        isToolActivated &&
        modeFlag &&
        spectrumCheckFlag &&
        (!extraInfoCheckParameters ||
          checkInfo(extraInfoCheckParameters, spectrum?.info as SpectrumInfo))
      );
    },

    [displayerMode, isExperimentalFeatureActivated, preferences, spectrum],
  );
}

function checkSpectrum(
  spectrum: any,
  options: ToolOptionItem['spectraOptions'],
) {
  let outerConditionResult = false;

  if (!options) {
    return true;
  }

  for (const option of options) {
    let innerConditionFlag = true;

    if (option.active) {
      if (spectrum) {
        for (const { key, value } of option.info || []) {
          if (spectrum.info[key] !== value) {
            innerConditionFlag = false;
          }
        }
      } else {
        innerConditionFlag = false;
      }
    }

    outerConditionResult = outerConditionResult || innerConditionFlag;
  }

  return outerConditionResult;
}

function checkInfo(checkParameters: SpectrumInfo, data: SpectrumInfo) {
  for (const key in checkParameters) {
    if (checkParameters[key] !== data[key]) {
      return false;
    }
  }

  return true;
}
