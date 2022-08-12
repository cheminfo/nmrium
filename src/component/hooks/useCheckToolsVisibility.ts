import lodashGet from 'lodash/get';
import { useCallback } from 'react';

import { Info1D } from '../../data/types/data1d/Info1D';
import { Info2D } from '../../data/types/data2d';
import { NMRiumToolBarPreferences } from '../../types/NMRiumToolBarPreferences';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { options } from '../toolbar/ToolTypes';

import useSpectrum from './useSpectrum';

const emptyData = { info: {} };

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
  const spectrum = useSpectrum(emptyData);

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
      const { spectrumType, mode } = options[toolKey];

      const modeFlag =
        !checkMode || (checkMode && (!mode || displayerMode === mode));

      const spectrumCheckFlag =
        !checkSpectrumType ||
        (checkSpectrumType &&
          (!spectrumType ||
            !spectrum ||
            (spectrumType === 'FID' && spectrum.info.isFid) ||
            (spectrumType === 'FT' && !spectrum.info.isFid)));

      return (
        flag &&
        modeFlag &&
        spectrumCheckFlag &&
        (!extraInfoCheckParameters ||
          checkInfo(extraInfoCheckParameters, spectrum.info))
      );
    },

    [displayerMode, preferences, spectrum],
  );
}

function checkInfo(checkParameters: SpectrumInfo, data: SpectrumInfo) {
  for (const key in checkParameters) {
    if (checkParameters[key] !== data[key]) {
      return false;
    }
  }

  return true;
}
