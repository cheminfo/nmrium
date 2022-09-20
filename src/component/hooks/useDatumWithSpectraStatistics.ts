import { useMemo } from 'react';

import { Info1D as Datum1DInfo, Data1D } from '../../data/types/data1d';
import { Info2D as Datum2DInfo, Data2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import nucleusToString from '../utility/nucleusToString';

interface SpectrumWithStatisticsProps {
  info: Datum1DInfo | Datum2DInfo;
  datum: Data1D | Data2D;
  ftCounter: number;
  fidCounter: number;
}

const emptyData = { info: {}, datum: {}, ftCounter: 0, fidCounter: 0 };

export default function useDatumWithSpectraStatistics(): SpectrumWithStatisticsProps {
  const {
    data,
    activeSpectrum,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

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
