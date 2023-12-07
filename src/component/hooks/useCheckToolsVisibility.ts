import lodashGet from 'lodash/get';
import { NMRiumToolBarPreferences } from 'nmr-load-save';
import { Info1D, Info2D } from 'nmr-processing';
import { useCallback } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { options, ToolOptionItem } from '../toolbar/ToolTypes';

import useCheckExperimentalFeature from './useCheckExperimentalFeature';
import useSpectrum from './useSpectrum';

type SpectrumInfo = Info1D | Info2D;

export interface CheckOptions {
  checkSpectrumType?: boolean;
  checkMode?: boolean;
  extraInfoCheckParameters?: SpectrumInfo;
}

export function useCheckToolsVisibility(): (
  toolKey: keyof NMRiumToolBarPreferences,
  checkOptions?: CheckOptions,
) => boolean {
  const { displayerMode } = useChartData();
  const preferences = usePreferences();
  const spectrum = useSpectrum(null);
  const isExperimentalFeatureActivated = useCheckExperimentalFeature();

  return useCallback(
    (toolKey, checkOptions: CheckOptions = {}) => {
      const {
        checkMode = true,
        checkSpectrumType = true,
        extraInfoCheckParameters,
      } = checkOptions;

      const { spectraOptions, mode, isExperimental } = options[toolKey];

      const flag = lodashGet(
        preferences.current,
        `display.toolBarButtons.${toolKey}`,
        false,
      );

      const modeFlag =
        !checkMode || (checkMode && (!mode || displayerMode === mode));

      const spectrumCheckFlag =
        !checkSpectrumType ||
        (checkSpectrumType && checkSpectrum(spectrum, spectraOptions));

      const isToolActivated =
        (flag && !isExperimental) ||
        (isExperimental && isExperimentalFeatureActivated);
      return (
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
