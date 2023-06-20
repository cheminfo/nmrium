import { v4 } from '@lukeed/uuid';
import { xyIntegration, xyMaxYPoint, xyMinYPoint } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';

import { RangeDetectionResult } from '../../../types/data1d';
import { getShiftX } from '../getShiftX';

interface DetectRangeOptions {
  from: number;
  to: number;
}

export function detectRange(
  spectrum: Spectrum1D,
  options: DetectRangeOptions,
): RangeDetectionResult {
  const { from, to } = options;
  const { x, re: y } = spectrum.data;

  const absolute = xyIntegration({ x, y }, { from, to, reverse: true });
  const min = xyMinYPoint({ x, y }, { from, to }).y;
  const max = xyMaxYPoint({ x, y }, { from, to }).y;

  const shiftX = getShiftX(spectrum);

  return {
    id: v4(),
    originFrom: from - shiftX,
    originTo: to - shiftX,
    from,
    to,
    absolute, // the real value,
    min,
    max,
  };
}
