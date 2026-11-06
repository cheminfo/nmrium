import type { Spectrum } from '@zakodium/nmrium-core';
import {
  axisUnits2DFid,
  axisUnits2DFt,
  defaultAxisUnit2DFid,
  defaultAxisUnit2DFt,
  isSpectrum2D,
} from '@zakodium/nmrium-core';
import { assertIn } from '@zakodium/utils';
import { scaleLinear } from 'd3-scale';

import type { State } from '../../reducer/Reducer.ts';

// Resolves the indirect-axis unit and converts its domain to that unit.
export function getIndirectAxis(
  state: Pick<State, 'view' | 'originDomain' | 'yDomain'>,
  spectrum: Spectrum | undefined,
) {
  if (!spectrum || !isSpectrum2D(spectrum)) return undefined;

  const nucleus = state.view.spectra.activeTab;
  const mode: 'ft' | 'fid' = spectrum.info.isFt ? 'ft' : 'fid';
  const unit =
    state.view.units2D[nucleus]?.indirect[mode] ??
    (mode === 'ft' ? defaultAxisUnit2DFt : defaultAxisUnit2DFid);
  const allowedUnits = mode === 'ft' ? axisUnits2DFt : axisUnits2DFid;
  assertIn(unit, allowedUnits);
  let domain = state.yDomain;

  if (unit === 'pt') {
    const ppmToPoint = scaleLinear(state.originDomain.yDomain, [
      0,
      spectrum.info.spectrumSize[1],
    ]);
    domain = domain.map((value) => ppmToPoint(value));
  } else if (unit === 'hz') {
    domain = domain.map((value) => value * spectrum.info.originFrequency[1]);
  }

  return { nucleus, mode, unit, allowedUnits, domain } as const;
}
