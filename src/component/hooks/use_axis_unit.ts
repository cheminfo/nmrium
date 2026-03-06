import type { AxisUnit } from '@zakodium/nmrium-core';

export const axisUnitToLabel: Record<AxisUnit, string> = {
  s: 'time [s]',
  hz: 'frequency [Hz]',
  ppm: 'δ [ppm]',
  pt: 'index [pt]',
};
