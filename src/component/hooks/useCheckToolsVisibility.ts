import lodashGet from 'lodash/get';
import { useCallback } from 'react';

import { Info1D } from '../../data/types/data1d/Info1D';
import { Info2D } from '../../data/types/data2d';
import { NMRiumToolBarPreferences } from '../../types/NMRiumToolBarPreferences';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { options, ToolOptionItem } from '../toolbar/ToolTypes';

import useSpectrum from './useSpectrum';

type SpectrumInfo = Info1D | Info2D;

interface CheckOptions {
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

  return useCallback(
    (toolKey, checkOptions: CheckOptions = {}) => {
      const {
        checkMode = true,
        checkSpectrumType = true,
        extraInfoCheckParameters,
      } = checkOptions;

      let flag = lodashGet(
        preferences.current,
        `display.toolBarButtons.${toolKey}`,
        false,
      );
      const { spectraOptions, mode } = options[toolKey];

      const modeFlag =
        !checkMode || (checkMode && (!mode || displayerMode === mode));

      const spectrumCheckFlag =
        !checkSpectrumType ||
        (checkSpectrumType && checkSpectrum(spectrum, spectraOptions));

      return (
        flag &&
        modeFlag &&
        spectrumCheckFlag &&
        (!extraInfoCheckParameters ||
          checkInfo(extraInfoCheckParameters, spectrum?.info))
      );
    },

    [displayerMode, preferences, spectrum],
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
        for (let { key, value } of option.info || []) {
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
