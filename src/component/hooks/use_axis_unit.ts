import type {
  AxisUnit1DFid,
  AxisUnit1DFt,
  AxisUnit2DFid,
  AxisUnit2DFt,
  AxisUnit,
  Nucleus1DUnit,
  Nucleus2DUnit,
} from '@zakodium/nmrium-core';
import {
  axisUnits1DFid,
  axisUnits1DFt,
  axisUnits2DFid,
  axisUnits2DFt,
} from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { assertUnreachable } from 'react-science/ui';

import { isSpectrum2D } from '../../data/data2d/Spectrum2D/index.ts';
import { useDispatch } from '../context/DispatchContext.tsx';

import useSpectrum from './useSpectrum.ts';
import { useAxisUnit1D, useAxisUnit2D } from './use_view.ts';
import { useVisibleSpectra1D } from './use_visible_spectra_1d.ts';

export const axisUnitToLabel: Record<AxisUnit, string> = {
  s: 'time [s]',
  hz: 'frequency [Hz]',
  ppm: 'δ [ppm]',
  pt: 'index [pt]',
};

function assertIn<V, T extends V>(value: V, values: T[]): asserts value is T {
  if (values.includes(value as any)) return;

  throw new Error(`Value ${String(value)} is not in [${values.join(',')}]`);
}

export function useHorizontalAxisUnit() {
  const spectra = useVisibleSpectra1D();
  const { nucleus, nucleusUnits } = useAxisUnit1D();
  const dispatch = useDispatch();

  const mode: keyof Nucleus1DUnit['horizontal'] = spectra[0]?.info.isFt
    ? 'ft'
    : 'fid';
  const unit: AxisUnit1DFid | AxisUnit1DFt = nucleusUnits.horizontal[mode];
  const allowedUnits: AxisUnit1DFid[] | AxisUnit1DFt[] =
    mode === 'ft' ? axisUnits1DFt : axisUnits1DFid;

  const setUnit = useCallback(
    (unit: AxisUnit) => {
      switch (mode) {
        case 'fid':
          assertIn(unit, axisUnits1DFid);
          return dispatch({
            type: 'SET_AXIS_UNIT_1D_HORIZONTAL',
            payload: { nucleus, mode, unit },
          });
        case 'ft':
          assertIn(unit, axisUnits1DFt);
          return dispatch({
            type: 'SET_AXIS_UNIT_1D_HORIZONTAL',
            payload: { nucleus, mode, unit },
          });
        default:
          assertUnreachable(mode);
      }
    },
    [dispatch, mode, nucleus],
  );

  return { mode, unit, allowedUnits, setUnit };
}

export function useDirectAxisUnit() {
  const { nucleus, units } = useAxisUnit2D();
  const spectrum = useSpectrum();
  const dispatch = useDispatch();

  return useMemo(() => {
    if (!spectrum) return;
    if (!isSpectrum2D(spectrum)) return;

    const mode: keyof Nucleus2DUnit['direct'] =
      spectrum.info.isFt || spectrum.info.isFtDimensionOne ? 'ft' : 'fid';
    const unit: AxisUnit2DFid | AxisUnit2DFt = units.direct[mode];
    const allowedUnits: AxisUnit2DFid[] | AxisUnit2DFt[] =
      mode === 'ft' ? axisUnits2DFt : axisUnits2DFid;

    function setUnit(unit: AxisUnit) {
      switch (mode) {
        case 'fid':
          assertIn(unit, axisUnits2DFid);
          return dispatch({
            type: 'SET_AXIS_UNIT_2D_DIRECT',
            payload: { nucleus, mode, unit },
          });
        case 'ft':
          assertIn(unit, axisUnits2DFt);
          return dispatch({
            type: 'SET_AXIS_UNIT_2D_DIRECT',
            payload: { nucleus, mode, unit },
          });
        default:
          assertUnreachable(mode);
      }
    }

    return { mode, unit, allowedUnits, setUnit };
  }, [dispatch, nucleus, spectrum, units.direct]);
}

export function useIndirectAxisUnit() {
  const { nucleus, units } = useAxisUnit2D();
  const spectrum = useSpectrum();
  const dispatch = useDispatch();

  return useMemo(() => {
    if (!spectrum) return;
    if (!isSpectrum2D(spectrum)) return;

    const mode: keyof Nucleus2DUnit['direct'] = spectrum.info.isFt
      ? 'ft'
      : 'fid';
    const unit: AxisUnit2DFid | AxisUnit2DFt = units.indirect[mode];
    const allowedUnits: AxisUnit2DFid[] | AxisUnit2DFt[] =
      mode === 'ft' ? axisUnits2DFt : axisUnits2DFid;

    function setUnit(unit: AxisUnit) {
      switch (mode) {
        case 'fid':
          assertIn(unit, axisUnits2DFid);
          return dispatch({
            type: 'SET_AXIS_UNIT_2D_INDIRECT',
            payload: { nucleus, mode, unit },
          });
        case 'ft':
          assertIn(unit, axisUnits2DFt);
          return dispatch({
            type: 'SET_AXIS_UNIT_2D_INDIRECT',
            payload: { nucleus, mode, unit },
          });
        default:
          assertUnreachable(mode);
      }
    }

    return { mode, unit, allowedUnits, setUnit };
  }, [dispatch, nucleus, spectrum, units.indirect]);
}
