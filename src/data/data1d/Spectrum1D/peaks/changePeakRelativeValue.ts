import type { Spectrum1D } from '@zakodium/nmrium-core';

import { getPeakAbsoluteArea } from '../../../utilities/getPeakAbsoluteArea.ts';

export interface ChangePeakRelativeValueProps {
  id: string;
  value: number;
}

export function changePeakRelativeValue(
  spectrum: Spectrum1D,
  data: ChangePeakRelativeValueProps,
) {
  const { id, value } = data;
  const index = spectrum.peaks.values.findIndex((peak) => peak.id === id);

  if (index === -1) return;

  const absolute = getPeakAbsoluteArea(spectrum.peaks.values[index]);
  const factor = absolute > 0 ? value / absolute : 0;

  spectrum.peaks.values = spectrum.peaks.values.map((peak) => ({
    ...peak,
    relativeArea: getPeakAbsoluteArea(peak) * factor,
  }));
}
