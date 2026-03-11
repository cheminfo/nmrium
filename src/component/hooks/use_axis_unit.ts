import type {
  AxisUnit1DFid,
  AxisUnit1DFt,
  AxisUnit2DFid,
  AxisUnit2DFt,
  AxisUnit,
  Nucleus1DUnit,
  Nucleus2DUnit,
} from '@zakodium/nmrium-core';

import { isSpectrum2D } from '../../data/data2d/Spectrum2D/index.ts';

import useSpectrum from './useSpectrum.ts';
import { useAxisUnit1D, useAxisUnit2D } from './use_view.ts';
import { useVisibleSpectra1D } from './use_visible_spectra_1d.ts';

export const axisUnitToLabel: Record<AxisUnit, string> = {
  s: 'time [s]',
  hz: 'frequency [Hz]',
  ppm: 'δ [ppm]',
  pt: 'index [pt]',
};

export function useHorizontalAxisUnit(): AxisUnit1DFid | AxisUnit1DFt {
  const spectra = useVisibleSpectra1D();
  const nucleusUnit = useAxisUnit1D();
  const type: keyof Nucleus1DUnit['horizontal'] = spectra[0]?.info.isFt
    ? 'ft'
    : 'fid';

  return nucleusUnit.horizontal[type];
}

export function useDirectAxisUnit(): AxisUnit2DFid | AxisUnit2DFt {
  const nucleusUnit = useAxisUnit2D();
  const spectrum = useSpectrum();

  if (!spectrum) return 'ppm';
  if (!isSpectrum2D(spectrum)) return 'ppm';

  const type: keyof Nucleus2DUnit['direct'] =
    spectrum.info.isFt || spectrum.info.isFtDimensionOne ? 'ft' : 'fid';

  return nucleusUnit.direct[type];
}

export function useIndirectAxisUnit(): AxisUnit2DFid | AxisUnit2DFt {
  const nucleusUnit = useAxisUnit2D();
  const spectrum = useSpectrum();

  if (!spectrum) return 'ppm';
  if (!isSpectrum2D(spectrum)) return 'ppm';

  const type: keyof Nucleus2DUnit['indirect'] =
    // TODO check isFt on indirect dimension (this info does not exists yet)
    spectrum.info.isFt ? 'ft' : 'fid';

  return nucleusUnit.indirect[type];
}
