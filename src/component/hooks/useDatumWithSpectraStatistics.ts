import { NmrData1D, NmrData2D } from 'cheminfo-types';
import { Info1D, Info2D } from 'nmr-processing';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import nucleusToString from '../utility/nucleusToString';

import { useActiveSpectrum } from './useActiveSpectrum';

interface SpectrumWithStatisticsProps {
  info: Info1D | Info2D;
  datum: NmrData1D | NmrData2D;
  ftCounter: number;
  fidCounter: number;
}

const emptyData = { info: {}, datum: {}, ftCounter: 0, fidCounter: 0 };

export default function useDatumWithSpectraStatistics(): SpectrumWithStatisticsProps {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  const activeSpectrum = useActiveSpectrum();
  return useMemo(() => {
    if (data) {
      let info: any = {};
      let datum: any = {};
      let ftCounter = 0;
      let fidCounter = 0;

      for (const dataInfo of data) {
        const { isFid, isFt, nucleus } = dataInfo.info;

        if (activeTab === nucleusToString(nucleus)) {
          if (isFid) {
            fidCounter++;
          }
          if (isFt) {
            ftCounter++;
          }
          if (activeSpectrum && dataInfo.id === activeSpectrum.id) {
            info = dataInfo.info;
            datum = dataInfo.data;
          }
        }
      }

      return {
        info,
        datum,
        ftCounter,
        fidCounter,
      };
    }
    return emptyData;
  }, [activeSpectrum, data, activeTab]);
}
