import type { Nucleus1DUnit, Nucleus2DUnit } from '@zakodium/nmrium-core';
import {
  defaultAxisUnit1DFid,
  defaultAxisUnit1DFt,
  defaultAxisUnit2DFid,
  defaultAxisUnit2DFt,
} from '@zakodium/nmrium-core';

import { useChartData } from '../context/ChartContext.tsx';

import { useActiveNucleusTab } from './useActiveNucleusTab.ts';

const defaultUnit1D: Nucleus1DUnit = {
  horizontal: {
    fid: defaultAxisUnit1DFid,
    ft: defaultAxisUnit1DFt,
  },
};
export function useAxisUnit1D() {
  const nucleus = useActiveNucleusTab();
  const { view } = useChartData();

  return view.units1D[nucleus] ?? defaultUnit1D;
}

const defaultUnit2D: Nucleus2DUnit = {
  direct: {
    fid: defaultAxisUnit2DFid,
    ft: defaultAxisUnit2DFt,
  },
  indirect: {
    fid: defaultAxisUnit2DFid,
    ft: defaultAxisUnit2DFt,
  },
};
export function useAxisUnit2D() {
  const nucleus = useActiveNucleusTab();
  const { view } = useChartData();

  return view.units2D[nucleus] ?? defaultUnit2D;
}
