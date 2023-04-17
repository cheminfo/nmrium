import {
  reimAbsolute,
  reimPhaseCorrection,
  reimAutoPhaseCorrection,
  DataReIm,
} from 'ml-spectra-processing';
import { Data1D, Spectrum1D } from 'nmr-load-save';

import { FilterDomainUpdateRules } from '../../FiltersManager';

export const id = 'phaseCorrection';
export const name = 'Phase correction';

export const DOMAIN_UPDATE_RULES: Readonly<FilterDomainUpdateRules> = {
  updateXDomain: false,
  updateYDomain: false,
};

/**
 *
 * @param {Spectrum1D} spectrum
 * @param {Object} [options={}]
 * @param {number} [options.ph0=0]
 * @param {number} [options.ph1=0]
 */

interface PhaseCorrectionOptions {
  ph0?: number;
  ph1?: number;
  absolute?: boolean;
}

export function apply(spectrum: Spectrum1D, options: PhaseCorrectionOptions) {
  if (!isApplicable(spectrum)) {
    throw new Error('phaseCorrection not applicable on this data');
  }

  const { absolute = false } = options;
  const filter = spectrum.filters?.find((filter) => filter.name === id);

  if (absolute) {
    spectrum.data.re = reimAbsolute(spectrum.data as DataReIm);
    spectrum.data.im = new Float64Array(0);
    if (filter) {
      filter.value = { ...filter.value, ph0: 0, ph1: 0, absolute };
    }
  } else if ('ph0' in options && 'ph1' in options) {
    let { ph0, ph1 } = options;
    phaseCorrection(spectrum, { ph0, ph1 });
    if (filter) {
      filter.value = { ...filter.value, absolute };
    }
  } else {
    let { ph0, ph1 } = autoPhaseCorrection(spectrum);
    phaseCorrection(spectrum, { ph0, ph1 });
    if (filter) {
      filter.value = { ...filter.value, absolute, ph0, ph1 };
    }
  }
}

export function isApplicable(
  spectrum: Spectrum1D,
): spectrum is Spectrum1D & { data: Required<Data1D> } {
  if (spectrum.info.isComplex && !spectrum.info.isFid) return true;
  return false;
}

export function reduce(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}

function phaseCorrection(spectrum, { ph0, ph1 }) {
  ph0 *= Math.PI / 180;
  ph1 *= Math.PI / 180;
  spectrum.data = {
    ...spectrum.data,
    ...reimPhaseCorrection(spectrum.data, ph0, ph1),
  };
}

interface AutoPhaseCorrectionOptions {
  minRegSize?: number;
  maxDistanceToJoin?: number;
  magnitudeMode?: boolean;
  factorNoise?: number;
}

function autoPhaseCorrection(
  spectrum: Spectrum1D,
  options: AutoPhaseCorrectionOptions = {},
) {
  const {
    minRegSize = 5,
    maxDistanceToJoin = 128,
    magnitudeMode = true,
    factorNoise = 5,
  } = options;

  return reimAutoPhaseCorrection(spectrum.data as any, {
    minRegSize,
    maxDistanceToJoin,
    magnitudeMode,
    factorNoise,
  });
}
