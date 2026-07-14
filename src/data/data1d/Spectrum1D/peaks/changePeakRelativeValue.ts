import type { NMRPeak1D, Peak1D } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { getShape1D } from 'ml-peak-shape-generator';

export interface ChangePeakRelativeValueProps {
  id: string;
  value: number;
}

function getPeakArea(peak: NMRPeak1D) {
  return peak.shape ? getShape1D(peak.shape).getArea() : 0;
}

export function changePeakRelativeValue(
  spectrum: Spectrum1D,
  data: ChangePeakRelativeValueProps,
) {
  const { id, value } = data;
  const index = spectrum.peaks.values.findIndex((peak) => peak.id === id);

  if (index !== -1) {
    const absolute = getPeakArea(spectrum.peaks.values[index]);
    const ratio = absolute / value;

    const peaks: Peak1D[] = [];
    let sum = 0;

    for (const peak of spectrum.peaks.values) {
      const relativeArea = getPeakArea(peak) / ratio;
      sum += relativeArea;
      peaks.push({ ...peak, relativeArea });
    }

    spectrum.peaks.options = {
      ...spectrum.peaks.options,
      mf: undefined,
      moleculeId: undefined,
      sumAuto: false,
      sum,
    };
    spectrum.peaks.values = peaks;
  }
}
