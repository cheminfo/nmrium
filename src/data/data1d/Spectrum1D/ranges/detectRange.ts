import { xyIntegration, xyMaxYPoint, xyMinYPoint } from 'ml-spectra-processing';
import type { Spectrum1D } from 'nmr-load-save';
import { getShiftX } from 'nmr-processing';

import type { RangeDetectionResult } from '../../../types/data1d/index.js';

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

  const absolute = xyIntegration({ x, y }, { from, to });
  const min = xyMinYPoint({ x, y }, { from, to }).y;
  const max = xyMaxYPoint({ x, y }, { from, to }).y;

  const shiftX = getShiftX(spectrum);

  return {
    id: crypto.randomUUID(),
    originalFrom: from - shiftX,
    originalTo: to - shiftX,
    from,
    to,
    absolute, // the real value,
    min,
    max,
  };
}
