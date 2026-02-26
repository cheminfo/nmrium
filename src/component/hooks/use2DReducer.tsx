import type { Spectrum2D } from '@zakodium/nmrium-core';
import type { NmrData2DContent, NmrData2DFt } from 'cheminfo-types';
import { useMemo } from 'react';

import { isFt2DSpectrum } from '../../data/data2d/Spectrum2D/isSpectrum2D.ts';
import { useChartData } from '../context/ChartContext.tsx';
import { getSpectraByNucleus } from '../utility/getSpectraByNucleus.ts';
import { reduce2DSpectrum } from './reduce2DSpectrum.ts';

export interface SpectrumFTData extends Pick<Spectrum2D, 'display' | 'id'> {
  data: NmrData2DContent;
}

export function use2DReducer(): SpectrumFTData[] {
  const {
    xDomain,
    yDomain,
    view: {
      spectra: { activeTab },
    },
    data,
  } = useChartData();
  const [fromX, toX] = xDomain;
  const [fromY, toY] = yDomain;

  return useMemo(() => {
    const outputSpectra: SpectrumFTData[] = [];
    for (const spectrum of getSpectraByNucleus(activeTab, data).filter(
      isFt2DSpectrum,
    )) {
      const { id, display, data } = spectrum;
      const { rr } = data as NmrData2DFt;
      const reducedData = reduce2DSpectrum(rr, {
        fromX,
        fromY,
        toX,
        toY,
      });
      outputSpectra.push({
        data: reducedData,
        id,
        display,
      });
    }
    return outputSpectra;
  }, [activeTab, data, fromX, fromY, toX, toY]);
}

export interface Reduce2DSpectrumOptions {
  numberOfPoints?: number;
  fromX?: number;
  toX?: number;
  fromY?: number;
  toY?: number;
}
