import { Correlation } from 'nmr-correlation';
import { useMemo } from 'react';

import { useChartData } from '../../../context/ChartContext';
import { useActiveSpectrum } from '../../../reducer/Reducer';

import { isInView } from './Utilities';

interface InputProps {
  correlation: Correlation;
}

function useInView({ correlation }: InputProps) {
  const {
    data: spectraData,
    xDomain,
    yDomain,
    displayerMode,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  const activeSpectrum = useActiveSpectrum();
  return useMemo(
    () =>
      isInView(
        spectraData,
        activeTab,
        activeSpectrum,
        xDomain,
        yDomain,
        displayerMode,
        correlation,
      ),
    [
      activeSpectrum,
      activeTab,
      correlation,
      displayerMode,
      spectraData,
      xDomain,
      yDomain,
    ],
  );
}

export default useInView;
