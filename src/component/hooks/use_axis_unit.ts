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
  defaultAxisUnit1DFid,
  defaultAxisUnit1DFt,
  defaultAxisUnit2DFid,
  defaultAxisUnit2DFt,
} from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { assertUnreachable } from 'react-science/ui';
import { match } from 'ts-pattern';

import { isSpectrum2D } from '../../data/data2d/Spectrum2D/index.ts';
import { isFid2DData } from '../../data/data2d/Spectrum2D/isSpectrum2D.ts';
import { useScale2DX } from '../2d/utilities/scale.ts';
import { useChartData } from '../context/ChartContext.tsx';
import { useDispatch } from '../context/DispatchContext.tsx';
import { useScaleChecked } from '../context/ScaleContext.tsx';

import { useActiveNucleusTab } from './useActiveNucleusTab.ts';
import { useActiveSpectra } from './useActiveSpectra.ts';
import useSpectrum from './useSpectrum.ts';
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
  const activeSpectra = useActiveSpectra();
  const firstActiveSpectrum = useMemo(() => {
    const firstSelected = activeSpectra?.find((s) => s.selected);
    return firstSelected
      ? spectra.find((s) => s.id === firstSelected.id)
      : spectra[0];
  }, [activeSpectra, spectra]);
  const { scaleX } = useScaleChecked();

  const { nucleus, nucleusUnits } = useAxisUnit1D();
  const dispatch = useDispatch();

  const mode: keyof Nucleus1DUnit['horizontal'] = firstActiveSpectrum?.info.isFt
    ? 'ft'
    : 'fid';
  const unit: AxisUnit1DFid | AxisUnit1DFt = nucleusUnits.horizontal[mode];
  const allowedUnits: AxisUnit1DFid[] | AxisUnit1DFt[] =
    mode === 'ft' ? axisUnits1DFt : axisUnits1DFid;

  const domain = useMemo(() => {
    function getPtDomain() {
      return [0, firstActiveSpectrum?.data.x.length ?? 0];
    }

    return match(mode)
      .with('fid', () =>
        match(unit)
          .with('s', () => undefined)
          .with('pt', getPtDomain)
          .with('hz', 'ppm', (unit) => {
            assertUnreachable(unit as never);
          })
          .exhaustive(),
      )
      .with('ft', () =>
        match(unit)
          .with('ppm', () => undefined)
          .with('pt', getPtDomain)
          .with('hz', () => {
            if (!firstActiveSpectrum) return undefined;

            const scale = scaleX();
            return scale
              .domain()
              .map((v) => v * firstActiveSpectrum.info.originFrequency);
          })
          .with('s', (unit) => {
            assertUnreachable(unit as never);
          })
          .exhaustive(),
      )
      .exhaustive();
  }, [firstActiveSpectrum, mode, scaleX, unit]);

  const setUnit = useCallback(
    (unit: AxisUnit) => {
      match(mode)
        .with('fid', (mode) => {
          assertIn(unit, axisUnits1DFid);
          return dispatch({
            type: 'SET_AXIS_UNIT_1D_HORIZONTAL',
            payload: { nucleus, mode, unit },
          });
        })
        .with('ft', (mode) => {
          assertIn(unit, axisUnits1DFt);
          return dispatch({
            type: 'SET_AXIS_UNIT_1D_HORIZONTAL',
            payload: { nucleus, mode, unit },
          });
        })
        .exhaustive();
    },
    [dispatch, mode, nucleus],
  );

  return { mode, unit, allowedUnits, setUnit, domain };
}

export function useDirectAxisUnit() {
  const { nucleus, units } = useAxisUnit2D();
  const spectrum = useSpectrum();
  const dispatch = useDispatch();
  const scaleX = useScale2DX();

  return useMemo(() => {
    if (!spectrum) return;
    if (!isSpectrum2D(spectrum)) return;

    const mode: keyof Nucleus2DUnit['direct'] =
      spectrum.info.isFt || spectrum.info.isFtDimensionOne ? 'ft' : 'fid';
    const unit: AxisUnit2DFid | AxisUnit2DFt = units.direct[mode];
    const allowedUnits: AxisUnit2DFid[] | AxisUnit2DFt[] =
      mode === 'ft' ? axisUnits2DFt : axisUnits2DFid;

    // spectrum.info.spectrumSize = [nbColumns, nbRows];
    // in nmrium-core formatSpectrum2D
    const directAxisIndex = 0;
    const ptDomain = [0, spectrum.info.spectrumSize[directAxisIndex]];

    const domain = match(mode)
      .with('fid', () =>
        match(unit)
          .with('s', () => undefined)
          .with('pt', () => ptDomain)
          .with('hz', 'ppm', (unit) => {
            assertUnreachable(unit as never);
          })
          .exhaustive(),
      )
      .with('ft', () =>
        match(unit)
          .with('ppm', () => undefined)
          .with('pt', () => ptDomain)
          .with('hz', () => {
            return scaleX
              .domain()
              .map((v) => v * spectrum.info.originFrequency[directAxisIndex]);
          })
          .with('s', (unit) => {
            assertUnreachable(unit as never);
          })
          .exhaustive(),
      )
      .exhaustive();

    function setUnit(unit: AxisUnit) {
      match(mode)
        .with('fid', (mode) => {
          assertIn(unit, axisUnits2DFid);
          return dispatch({
            type: 'SET_AXIS_UNIT_2D_DIRECT',
            payload: { nucleus, mode, unit },
          });
        })
        .with('ft', (mode) => {
          assertIn(unit, axisUnits2DFt);
          return dispatch({
            type: 'SET_AXIS_UNIT_2D_DIRECT',
            payload: { nucleus, mode, unit },
          });
        })
        .exhaustive();
    }

    return { mode, unit, allowedUnits, setUnit, domain };
  }, [dispatch, nucleus, scaleX, spectrum, units.direct]);
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
      match(mode)
        .with('fid', (mode) => {
          assertIn(unit, axisUnits2DFid);
          return dispatch({
            type: 'SET_AXIS_UNIT_2D_INDIRECT',
            payload: { nucleus, mode, unit },
          });
        })
        .with('ft', (mode) => {
          assertIn(unit, axisUnits2DFt);
          return dispatch({
            type: 'SET_AXIS_UNIT_2D_INDIRECT',
            payload: { nucleus, mode, unit },
          });
        })
        .exhaustive();
    }

    return { mode, unit, allowedUnits, setUnit };
  }, [dispatch, nucleus, spectrum, units.indirect]);
}

const defaultUnit1D: Nucleus1DUnit = {
  horizontal: {
    fid: defaultAxisUnit1DFid,
    ft: defaultAxisUnit1DFt,
  },
};

function useAxisUnit1D() {
  const nucleus = useActiveNucleusTab();
  const { view } = useChartData();

  const nucleusUnits = view.units1D[nucleus] ?? defaultUnit1D;

  return { nucleus, nucleusUnits };
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

function useAxisUnit2D() {
  const nucleus = useActiveNucleusTab();
  const { view } = useChartData();

  const units = view.units2D[nucleus] ?? defaultUnit2D;

  return { nucleus, units };
}
