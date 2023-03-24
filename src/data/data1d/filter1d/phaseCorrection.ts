import {
  reimAbsolute,
  reimPhaseCorrection,
  reimAutoPhaseCorrection,
} from 'ml-spectra-processing';

import { Data1D } from '../../types/data1d/Data1D';
import { Datum1D } from '../../types/data1d/Datum1D';

export const id = 'phaseCorrection';
export const name = 'Phase correction';

/**
 *
 * @param {Datum1d} datum1d
 * @param {Object} [options={}]
 * @param {number} [options.ph0=0]
 * @param {number} [options.ph1=0]
 */

interface PhaseCorrectionOptions {
  ph0?: number;
  ph1?: number;
  absolute?: boolean;
}

export function apply(datum1D: Datum1D, options: PhaseCorrectionOptions) {
  if (!isApplicable(datum1D)) {
    throw new Error('phaseCorrection not applicable on this data');
  }

  const { absolute = false } = options;
  const filter = datum1D.filters?.find((filter) => filter.name === id);

  if (absolute) {
    datum1D.data.re = reimAbsolute(datum1D.data);
    datum1D.data.im = new Float64Array(0);
    if (filter) {
      filter.value = { ...filter.value, ph0: 0, ph1: 0, absolute };
    }
  } else if ('ph0' in options && 'ph1' in options) {
    let { ph0, ph1 } = options;
    phaseCorrection(datum1D, { ph0, ph1 });
    if (filter) {
      filter.value = { ...filter.value, absolute };
    }
  } else {
    let { ph0, ph1 } = autoPhaseCorrection(datum1D);
    phaseCorrection(datum1D, { ph0, ph1 });
    if (filter) {
      filter.value = { ...filter.value, absolute, ph0, ph1 };
    }
  }
}

export function isApplicable(
  datum1D: Datum1D,
): datum1D is Datum1D & { data: Required<Data1D> } {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}

function phaseCorrection(datum1D, { ph0, ph1 }) {
  ph0 *= Math.PI / 180;
  ph1 *= Math.PI / 180;
  datum1D.data = {
    ...datum1D.data,
    ...reimPhaseCorrection(datum1D.data, ph0, ph1),
  };
}

interface AutoPhaseCorrectionOptions {
  minRegSize?: number;
  maxDistanceToJoin?: number;
  magnitudeMode?: boolean;
  factorNoise?: number;
}

function autoPhaseCorrection(
  datum1D: Datum1D,
  options: AutoPhaseCorrectionOptions = {},
) {
  const {
    minRegSize = 5,
    maxDistanceToJoin = 128,
    magnitudeMode = false,
    factorNoise = 5,
  } = options;

  return reimAutoPhaseCorrection(datum1D.data as any, {
    minRegSize,
    maxDistanceToJoin,
    magnitudeMode,
    factorNoise,
  });
}
