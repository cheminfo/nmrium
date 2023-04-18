import { v4 } from '@lukeed/uuid';
import { xyIntegration } from 'ml-spectra-processing';
import { Integral, Spectrum1D } from 'nmr-load-save';

import { ShiftTarget } from '../../../types/common/MapOptions';
import { getShiftX } from '../getShiftX';

function getRange(integral: Integral, shiftTarget: ShiftTarget, shift: number) {
  const { originFrom, originTo, from, to } = integral;
  if (shiftTarget === 'origin') {
    return {
      originFrom: from - shift,
      originTo: to - shift,
      from,
      to,
    };
  } else {
    return {
      originFrom,
      originTo,
      from: originFrom + shift,
      to: originTo + shift,
    };
  }
}

export function mapIntegrals(
  integrals: Integral[],
  spectrum: Spectrum1D,
  shiftTarget: ShiftTarget = 'origin',
) {
  const { x, re } = spectrum.data;
  const shiftX = getShiftX(spectrum);

  return integrals.map((integral) => {
    const integralBoundary = getRange(integral, shiftTarget, shiftX);

    const absolute = xyIntegration(
      { x, y: re },
      { from: integralBoundary.from, to: integralBoundary.to, reverse: true },
    );

    return {
      ...integral,
      id: integral.id || v4(),
      ...integralBoundary,
      absolute,
    };
  });
}
